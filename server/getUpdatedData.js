const
   { pool } = require('./config/pgConfig'),
   allGetQueries = require('./allGetQueries')


const getUpdatedData = async (table, condition) => {

   const query = allGetQueries[table]

   const data = () => new Promise((resolve, reject) => {
      pool.query(query(condition), (err, t) => {
         if (err) {
            console.log(err)
            reject(err)
         }
         if (t && t.rows)
            resolve(t.rows)
      })
   })
   return data()
}
module.exports = { getUpdatedData }