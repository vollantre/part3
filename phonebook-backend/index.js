require('dotenv').config()
const express = require('express')

const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('body', (req, res) => JSON.stringify(req.body))

app.use(express.static('build'))
app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

app.get('/', (req, res) => {
  res.send('<h1>KILLAR QUEEN BITES ZA DUSTO!</h1><h1>ZA WARUDO!!!</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons.map((p) => p.toJSON()))
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((p) => {
      if (p) {
        res.json(p.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.get('/info', (req, res) => {
  Person
    .find({})
    .then((persons) => {
      res.send(`Phonebook has info for ${persons.length} people <br/><br/> ${new Date()}`)
    })
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.status(204).end()
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const { body } = req
  console.log(body)

  if (!body.name) {
    return res.status(400).json({ error: 'no name given' })
  } if (!body.number) {
    return res.status(400).json({ error: 'no number given' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then((p) => {
    console.log(`${p.name} added to phonebook`)
    res.json(p)
  })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { body } = req
  const person = {
    name: body.name,
    number: body.number,
  }
  Person
    .findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => {
      res.json(updatedPerson.toJSON())
    })
    .catch((error) => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ error: 'malformated id' })
  } if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
