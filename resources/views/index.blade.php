<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Folder Structure</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <!-- Add Tailwind CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@^2.2/dist/tailwind.min.css" rel="stylesheet">
    <!-- Add FontAwesome CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">

    <link rel="stylesheet" href="{{ asset('css/styles.css') }}">

</head>

<body class="bg-gray-100 font-sans antialiased">
    <div class="container mx-auto p-6 ">
        <h1 class="text-4xl font-bold text-gray-800 mb-8 text-center">Folder Structure and size</h1>

        <form id="file-upload-form" action="/upload" method="post" enctype="multipart/form-data"
            class="bg-white p-6 rounded-lg shadow-md mb-8">
            @csrf
            <div class="flex flex-col md:flex-row md:items-center md:space-x-4">
                <input type="file" name="file" accept=".zip"
                    class="border border-gray-300 rounded-lg p-3 text-gray-700 mb-4 md:mb-0 flex-grow">
                <button type="submit"
                    class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Upload
                    ZIP</button>
            </div>
        </form>


        <!-- Loader Element -->
        <div id="loader" class="hidden flex flex-col justify-center items-center mb-6">
            <div class="loader"></div>
            <div class="progress-bar-container">
                <div class="progress-bar">
                    <div id="progress-bar-inner" class="progress-bar-inner"></div>
                    <div id="progress-percentage" class="progress-percentage">0%</div>
                </div>
            </div>
        </div>

        <!-- Results Element -->
        <div id="results" class="bg-white border border-gray-300 rounded-lg p-6 shadow-lg hidden">
            <!-- Results will be displayed here -->
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js" defer></script>
    <script src="{{ asset('js/script.js') }}" defer></script>
</body>

</html>
