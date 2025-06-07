/*
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const poolPromise = new sql.ConnectionPool(process.env.DB_CONNECTION_STRING)
    .connect()
    .then(pool => {
        console.log('Connected to Azure SQL Database');
        return pool;
    })
    .catch(err => {
        console.error('Database Connection Failed: ', err);
        process.exit(1);
    });

export { poolPromise };
*/
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const dbConnectionString = process.env.DB_CONNECTION_STRING;

const parseConnectionString = (connectionString) => {
    const params = connectionString.split(';');
    const config = {};

    params.forEach(param => {
        const [key, value] = param.split('=');
        if (key && value) {
            config[key.trim().toLowerCase()] = value.trim();
        }
    });

    const serverAndPort = config['server'].replace('tcp:', '').split(',');

    return {
        user: config['user id'],
        password: config['password'],
        server: serverAndPort[0], // Extract server name
        port: parseInt(serverAndPort[1], 10) || 1433, // Extract port number
        database: config['initial catalog'],
        options: {
            encrypt: config['encrypt'] === 'True',
            trustServerCertificate: config['trustservercertificate'] === 'True'
        }
    };
};

const config = parseConnectionString(dbConnectionString);

export const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL');
        return pool;
    })
    .catch(err => {
        console.error('Database Connection Failed: ', err);
        throw err;
    });

export { sql };