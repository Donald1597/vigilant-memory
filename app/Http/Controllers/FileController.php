<?php

namespace App\Http\Controllers;

use App\Services\ZipService;
use App\Services\FolderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class FileController extends Controller
{
    protected $zipService;
    protected $folderService;

    public function __construct(ZipService $zipService, FolderService $folderService)
    {
        $this->zipService = $zipService;
        $this->folderService = $folderService;
    }

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

            $file = $request->file('file');

            // Validate file presence
            if (!$file) {
                return response()->json(['error' => 'No file uploaded.'], 400);
            }

            $zipPath = $file->storeAs('uploads', $file->getClientOriginalName());
            $zipFullPath = storage_path('app/' . $zipPath);

            // Unzip the ZIP file
            $extractedPath = $this->zipService->extractZip($zipFullPath);

            // Get the folder structure
            $structure = $this->folderService->getFolderStructure($extractedPath);

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

    private function clearUploadsDirectory()
    {
        $uploadsPath = storage_path('app/uploads');
        if (File::exists($uploadsPath)) {
            File::deleteDirectory($uploadsPath);
        }
        File::makeDirectory($uploadsPath, 0755, true);
    }
}
