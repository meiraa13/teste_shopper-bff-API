import app from './app'
import { AppDataSource } from './data-source'
import { startDatabase } from './database/config'

// AppDataSource.initialize()
//     .then(() => {
//         console.log('Database connected!')
//         app.listen(3000, () => {
//             console.log('Server running on port 3000')
//         })
//     })
//     .catch((err) => {
//         console.error('Error during Data Source initialization', err)
//     })

const port:number = 3000
app.listen(port, async () => {
    await startDatabase()
    console.log(`Server running on port ${port}`)
})