const { Router } = require('express')
const User = require('../models/user')
const bcrypt = require('bcrypt')

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
    const { first_name, last_name, email, password } = req.body
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

router.get('/sign_in', (req, res) => {
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
    await User.findById(req.session.userId).exec()
        .then(user => {
            try {
                res.render('profile', {
                    userid: req.session.userId,
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    password: user.password
                })
            } catch (e) {
                res.redirect('/sign_in')
            }
        })

})

router.post('/profile', async (req, res) => {
    await User.findById(req.session.userId).exec()
        .then(user => {
            try {
                const { password, email, first_name, last_name } = req.body
                user.password = password
                user.email = email
                user.first_name= first_name
                user.last_name = last_name
                user.save()

                res.redirect('/profile')
            } catch (e) {
                res.redirect('/sign_in')
            }
        })
})

router.post('/profile/delete',async (req, res) => {
    try {
        req.session.userId = undefined
        res.redirect('/')
    } catch (e) {
        console.log(e)
        res.redirect('/')
    }
})

module.exports = router