const { Router } = require('express')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const mongo = require('mongodb')

const { db_config } = require('../config')

const router = Router()

router.get('/', (req, res) => {
    res.render("index", {
        userid: req.session.userId
    })
})

router.get('/register', (req, res) => {
    res.render('registration')
})

router.post('/register', async (req, res) => {
    const { password, email, first_name, last_name } = req.body
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        await User.findOne({ email }).exec()
            .then(user => {
                if (user) {
                    res.render('registration', {
                        error: "Such user is already exist"
                    })
                } else {
                    const user = User.create({
                        first_name,
                        last_name,
                        email,
                        password: hashedPassword
                    })
                    res.redirect('/')
                }
            })


    } catch (e) {
        console.log(e)
    }
})

router.get('/sign_in', async (req, res) => {
    res.render('login')

})


async function validateData(user, res, req, password) {
    if (!user){
        res.render('login', {
            error: "Such user doesn`t exist!"
        })
    } else {
        try {
            if (await bcrypt.compare(password, user.password)) {
                req.session.userId = user.id
                res.redirect('/')
            } else {
                res.render('login', {
                    error: "Invalid data!"
                })
            }
        } catch (e) {
            console.log(e)
        }
    }
}

router.post('/sign_in', async (req, res) => {
    const { email, password } = req.body
    User.findOne({ email }).exec()
        .then(user => {
            validateData(user, res, req, password)
        })

})


router.get('/profile', async (req, res) => {
    await User.findById(req.session.userId).lean().exec()
        .then(user => {
            try {
                if (user.address) {
                    console.log("user")
                    res.render('profile', {
                        userid: req.session.userId,
                        user: user,
                        lng: user.address.lng || undefined,
                        lat: user.address.lat || undefined
                    })
                } else {
                    res.render('profile', {
                        userid: req.session.userId,
                        user: user,
                    })
                }

            } catch (e) {
                console.log(e)
                res.redirect('/sign_in')
            }
        })

})

router.post('/profile', async (req, res) => {
    await User.findById(req.session.userId).exec()
        .then(user => {
            try {
                const { email, first_name, last_name, user_address } = req.body
                user.email = email
                user.first_name= first_name
                user.last_name = last_name
                user.save()
                console.log(user)


                res.redirect('/profile')
            } catch (e) {
                res.redirect('/sign_in')
            }
        })
})

router.post('/profile/delete',async (req, res) => {
    try {
        await User.findByIdAndDelete(req.body.user_id)
        req.session.userId = undefined
        res.redirect('/')
    } catch (e) {
        res.redirect('/')
    }
})


router.get('/api/set_address', async (req, res) => {
    const { user_id } = req.query

    delete req.query.user_id

    if (req.query.lat && req.query.lng && user_id) {
        await User.findById(user_id).exec()
            .then(user => {
                if (user) {
                    user.address = req.query
                    console.log(user)
                    user.save()
                    res.status(200).send({
                        detail: "The address updated successfully"
                    })
                } else {
                    res.sendStatus(400)
                }
            })
    } else {
        res.sendStatus(400)
    }
})

module.exports = router