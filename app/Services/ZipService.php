<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use ZipArchive;

class ZipService
{
    public function extractZip($filePath)
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

    private function isSystemFile($filename)
    {
        // Filter .DS_Store files, _* files, and folders that start with _
        return strpos($filename, '.DS_Store') !== false || strpos($filename, '._') === 0 || strpos($filename, '_') === 0 || strpos($filename, '__') === 0;
    }
}
