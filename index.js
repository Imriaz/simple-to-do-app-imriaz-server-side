const express = require('express')
const app = express()
const cors = require('cors');
//const admin = require("firebase-admin");
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

//const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y1dxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



// async function verifyToken(req, res, next) {
//     if (req.headers?.authorization?.startsWith('Bearer ')) {
//         const token = req.headers.authorization.split(' ')[1];

//         try {
//             const decodedUser = await admin.auth().verifyIdToken(token);
//             req.decodedEmail = decodedUser.email;
//         }
//         catch {

//         }

//     }
//     next();
// }

async function run() {
    try {
        await client.connect();
        const database = client.db('ToDoListAppImriaz');
        const notesCollection = database.collection('notes');
        const usersCollection = database.collection('users');
        const subscriptionsCollection = database.collection('Subscription');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('review');

        // app.get('/subscriptions', verifyToken, async (req, res) => {

        //GET API for Show All Subscription
        app.get('/subscriptions', async (req, res) => {
            const cursor = subscriptionsCollection.find({});
            const subscriptions = await cursor.toArray();
            res.send(subscriptions);
        });

        //GET my Notes
        app.get('/myNotes/:email', async (req, res) => {
            const result = await notesCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });

        //Get API for Manage All Users
        app.get('/manageAllUsers', async (req, res) => {
            const result = await usersCollection.find({}).toArray();
            res.send(result);
        });

        //Get API for Manage My Users
        app.get('/manageAllUsers/:email', async (req, res) => {
            const result = await usersCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });

        //Add Notes API
        app.post('/addNotes', async (req, res) => {
            const notes = req.body;
            const result = await notesCollection.insertOne(notes);
            res.send(result);
        });

        //UPDATE my Notes
        app.patch('/updateNote/:id', (req, res) => {
            const id = req.params.id;
            const note = req.body;
            console.log(id, note)
            notesCollection.updateOne({ _id: ObjectId(id) }, {
                $set: { Title: note.Title, Notes: note.description }
            })
                .then(result => {
                    res.send({ count: result.modifiedCount });
                })
        })

        //DELETE My Notes
        app.delete('/deleteMyNotes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            console.log(id);
            const result = await notesCollection.deleteOne(query);
            res.send(result);
        });

        //Add Review API
        app.post('/addReview', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        });

        //Get API for All Review 
        app.get('/addReview', async (req, res) => {
            const result = await reviewsCollection.find({}).toArray();
            res.send(result);
            console.log(result);
        });

        //DELETE Product
        app.delete('/deleteProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await notesCollection.deleteOne(query);
            res.send(result);
        });

        //Add User to the Database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        //Add Subscription API
        app.post('/addSubscription', async (req, res) => {
            const subscription = req.body;
            const result = await subscriptionsCollection.insertOne(subscription);
            res.send(result);
        });

        //Get API for Manage All Subscription
        app.get('/manageAllSubscription', async (req, res) => {
            const result = await subscriptionsCollection.find({}).toArray();
            res.send(result);
            console.log(result);
        });

        //GET my Subscriptions
        app.get('/mySubscriptions/:email', async (req, res) => {
            const result = await ordersCollection.find({
                email: req.params.email,
            }).toArray();
            res.send(result);
        });

        //DELETE my Subscriptions
        app.delete('/deleteMySubscription/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
        });

        //DELETE Subscription
        app.delete('/deleteSubscription/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await subscriptionsCollection.deleteOne(query);
            res.send(result);
        });

        //ADD Subscription Order by POST Method
        app.post('/orders', async (req, res) => {
            const orderSubscription = req.body;
            const result = await ordersCollection.insertOne(orderSubscription);
            res.send(result);
        });

        //Get Subscription Order for Payment Method
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.findOne(query);
            res.json(result);
        });

        //PUT Subscription Order Payment Status to Database
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    payment: payment
                }
            };
            const result = await ordersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // make admin role PUT API 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            // console.log('decodedEmail', req.decodedEmail);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result);

        });

        // admin data get by GET 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        //DELETE User Account
        app.delete('/deleteUserAccount/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        });

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello To Do List App by Imriaz')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})