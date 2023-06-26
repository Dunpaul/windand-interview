const fs = require('fs');

function filterAndSortBooks(inputFile, outputFile, genre) {
    // Create a readable stream to read the dataset file
    const readStream = fs.createReadStream(inputFile, { encoding: 'utf8' });

    // Create a writable stream to write the sorted books to the output file
    const writeStream = fs.createWriteStream(outputFile, { encoding: 'utf8' });

    // Array to store filtered books
    const filteredBooks = [];

    // Read the dataset file line by line
    readStream.on('data', (chunk) => {
        const books = chunk.split('\n');

        // Filter books based on the specified genre
        for (let i = 0; i < books.length; i++) {
            const book = JSON.parse(books[i]);
            if (book.genre === genre) {
                filteredBooks.push(book);
            }
        }
    });

    // After reading the file, sort the filtered books and write them to the output file
    readStream.on('end', () => {
        // Sort the filtered books by published date in descending order
        const sortedBooks = filteredBooks.sort((a, b) => new Date(b.published_date) - new Date(a.published_date));

        // Write the sorted books to the output file
        writeStream.write(JSON.stringify(sortedBooks, null, 2));

        // Close the writable stream
        writeStream.end();
    });
}

// Usage: filterAndSortBooks('input.json', 'output.json', 'Fantasy');
