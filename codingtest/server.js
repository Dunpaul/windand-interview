const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Sequelize, DataTypes } = require('sequelize');

// Connect to the database
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'mysql'
});

// Define the Book model
const Book = sequelize.define('Book', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    genre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    publishedDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

// Define the User model
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Create associations
User.hasMany(Book);
Book.belongsTo(User);

// Create the tables if they don't exist
sequelize.sync();

app.use(express.json());

// Generate JWT token
function generateToken(user) {
    const payload = {
        id: user.id,
        username: user.username
    };
    return jwt.sign(payload, 'secretkey', { expiresIn: '1h' });
}

// Middleware to verify JWT
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }
    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.userId = decoded.id;
        next();
    });
}

// Create a new book
app.post('/api/books', verifyToken, (req, res) => {
    const { title, author, genre, publishedDate, description } = req.body;
    Book.create({
        title,
        author,
        genre,
        publishedDate,
        description,
        UserId: req.userId
    })
        .then(book => res.status(201).json(book))
        .catch(err => res.status(500).json({ message: err.message }));
});

// Retrieve a specific book by its ID
app.get('/api/books/:id', verifyToken, (req, res) => {
    const bookId = parseInt(req.params.id);
    Book.findOne({ where: { id: bookId, UserId: req.userId } })
        .then(book => {
            if (book) {
                res.json(book);
            } else {
                res.status(404).json({ message: 'Book not found' });
            }
        })
        .catch(err => res.status(500).json({ message: err.message }));
});

// Update an existing book
app.put('/api/books/:id', verifyToken, (req, res) => {
    const bookId = parseInt(req.params.id);
    const { title, author, genre, publishedDate, description } = req.body;
    Book.findOne({ where: { id: bookId, UserId: req.userId } })
        .then(book => {
            if (book) {
                book.title = title || book.title;
                book.author = author || book.author;
                book.genre = genre || book.genre;
                book.publishedDate = publishedDate || book.publishedDate;
                book.description = description || book.description;
                return book.save();
            } else {
                res.status(404).json({ message: 'Book not found' });
            }
        })
        .then(updatedBook => res.json(updatedBook))
        .catch(err => res.status(500).json({ message: err.message }));
});

// Delete a book
app.delete('/api/books/:id', verifyToken, (req, res) => {
    const bookId = parseInt(req.params.id);
    Book.findOne({ where: { id: bookId, UserId: req.userId } })
        .then(book => {
            if (book) {
                return book.destroy();
            } else {
                res.status(404).json({ message: 'Book not found' });
            }
        })
        .then(() => res.json({ message: 'Book deleted' }))
        .catch(err => res.status(500).json({ message: err.message }));
});

// User registration endpoint
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            res.status(500).json({ message: err.message });
        } else {
            User.create({ username, password: hash })
                .then(user => res.status(201).json(user))
                .catch(err => res.status(500).json({ message: err.message }));
        }
    });
});

// User login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    User.findOne({ where: { username } })
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    const token = generateToken(user);
                    res.json({ token });
                } else {
                    res.status(401).json({ message: 'Authentication failed' });
                }
            });
        })
        .catch(err => res.status(500).json({ message: err.message }));
});

// Start the server
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
