<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class FolderService
{
    public function getFolderStructure($path)
    {
        return $this->buildFolderStructure($path);
    }

    private function buildFolderStructure($path)
    {
        $structure = [];

        // Retrieve and filter directories
        $directories = $this->filterSystemFiles(File::directories($path));
        foreach ($directories as $directory) {
            $structure[] = $this->getDirectoryDetails($directory);
        }

        // Retrieve and filter files
        $files = $this->filterSystemFiles(File::files($path), true);
        foreach ($files as $file) {
            $structure[] = $this->formatFileDetails($file);
        }

        return $structure;
    }

    private function getDirectoryDetails($path)
    {
        return [
            'name' => basename($path),
            'size' => $this->calculateFolderSize($path),
            'children' => $this->buildFolderStructure($path),
        ];
    }

    private function formatFileDetails($file)
    {
        return [
            'name' => $file->getFilename(),
            'size' => $this->formatBytes($file->getSize()),
            'children' => [],
        ];
    }

    private function calculateFolderSize($folder)
    {
        $totalSize = array_sum(
            array_map(
                function ($file) {
                    return $file->getSize();
                },
                $this->filterSystemFiles(File::allFiles($folder))
            )
        );

        return $this->formatBytes($totalSize);
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        if ($bytes == 0) return '0 B';

        $pow = floor(log($bytes, 1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= (1 << (10 * $pow));

        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    private function filterSystemFiles($items, $isFile = false)
    {
        return array_filter($items, function ($item) use ($isFile) {
            $filename = $isFile ? $item->getFilename() : basename($item);
            return !$this->isSystemFile($filename);
        });
    }

    private function isSystemFile($filename)
    {
        // Filter .DS_Store files, _* files, and folders that start with _
        return strpos($filename, '.DS_Store') !== false || strpos($filename, '._') === 0 || strpos($filename, '_') === 0 || strpos($filename, '__') === 0;
    }
}
