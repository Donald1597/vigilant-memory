<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use ZipArchive;

class FileController extends Controller
{
    public function index()
    {
        return view('index');
    }

    public function upload(Request $request)
    {
        try {

            // Empty the 'uploads' folder before storing new files
            $this->clearUploadsDirectory();

            // Validate the ZIP file
            $request->validate([
                'file' => 'required|file|mimes:zip|max:2048000', // 2GB max
            ]);

            // Make sure a ZIP file is downloaded
            $file = $request->file('file');
            if (!$file) {
                return response()->json(['error' => 'No file uploaded.'], 400);
            }

            // Move the ZIP file to the temporary directory
            $zipPath = $file->storeAs('uploads', $file->getClientOriginalName());
            $zipFullPath = storage_path('app/' . $zipPath);

            // Unzip the ZIP file
            $this->extractZip($zipFullPath);

            // Get the folder structure
            $extractedPath = pathinfo($zipFullPath, PATHINFO_FILENAME);
            $structure = $this->getFolderStructure(storage_path('app/uploads/' . $extractedPath));

            // Delete the ZIP file after extraction
            File::delete($zipFullPath);

            // Clean the folder after displaying the results
            $this->clearUploadsDirectory();


            return response()->json(['structure' => $structure]);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => 'An error occurred while processing the file.'], 500);
        }
    }

    private function extractZip($filePath)
    {
        $zip = new ZipArchive;
        $extractPath = pathinfo($filePath, PATHINFO_FILENAME);
        $extractTo = storage_path('app/uploads/' . $extractPath);

        if ($zip->open($filePath) === TRUE) {
            $zip->extractTo($extractTo);
            $zip->close();

            // Clean unwanted files
            $this->cleanUpExtractedFiles($extractTo);
        } else {
            throw new \Exception('Failed to open ZIP file.');
        }

        return $extractTo;
    }

    private function cleanUpExtractedFiles($path)
    {
        $files = File::allFiles($path);
        foreach ($files as $file) {
            if ($this->isSystemFile($file->getFilename())) {
                File::delete($file->getPathname());
            }
        }

        $directories = File::directories($path);
        foreach ($directories as $directory) {
            $this->cleanUpExtractedFiles($directory);
        }
    }

    private function getFolderStructure($path)
    {
        $structure = [];

        // Filter files and folders
        $children = array_filter(File::directories($path), function ($child) {
            return !$this->isSystemFile(basename($child));
        });

        foreach ($children as $child) {
            $structure[] = $this->getDirectoryDetails($child);
        }

        $files = array_filter(File::files($path), function ($file) {
            return !$this->isSystemFile($file->getFilename());
        });

        foreach ($files as $file) {
            $structure[] = [
                'name' => $file->getFilename(),
                'size' => $this->formatBytes($file->getSize()),
                'children' => [],
            ];
        }

        return $structure;
    }

    private function getDirectoryDetails($path)
    {
        $details = [
            'name' => basename($path),
            'size' => $this->calculateFolderSize($path),
            'children' => [],
        ];

        $children = array_filter(File::directories($path), function ($child) {
            return !$this->isSystemFile(basename($child));
        });

        foreach ($children as $child) {
            $details['children'][] = $this->getDirectoryDetails($child);
        }

        $files = array_filter(File::files($path), function ($file) {
            return !$this->isSystemFile($file->getFilename());
        });

        foreach ($files as $file) {
            $details['children'][] = [
                'name' => $file->getFilename(),
                'size' => $this->formatBytes($file->getSize()),
                'children' => [],
            ];
        }

        return $details;
    }

    private function calculateFolderSize($folder)
    {
        $totalSize = 0;

        $files = File::allFiles($folder);
        foreach ($files as $file) {
            if (!$this->isSystemFile($file->getFilename())) {
                $totalSize += $file->getSize();
            }
        }

        return $this->formatBytes($totalSize);
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= (1 << (10 * $pow));

        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    private function isSystemFile($filename)
    {
        // Filter .DS_Store files, _* files, and folders that start with _
        return strpos($filename, '.DS_Store') !== false || strpos($filename, '._') === 0 || strpos($filename, '_') === 0 || strpos($filename, '__') === 0;
    }

    private function clearUploadsDirectory()
    {
        $uploadsPath = storage_path('app/uploads');
        if (File::exists($uploadsPath)) {
            File::deleteDirectory($uploadsPath);
        }
        File::makeDirectory($uploadsPath, 0755, true);
    }
}
