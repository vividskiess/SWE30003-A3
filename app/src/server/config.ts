
import MariaDB from "mariadb"
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

class Config {
	public DB: string | undefined;
  public DB_HOST: string | undefined;
  public DB_USER: string | undefined;
	public DB_PASSWORD: string | undefined;
	public CONNECTION_LIMIT: number | undefined;
	public TRACE: boolean | undefined;
	public pool: MariaDB.Pool | undefined;

	private readonly DEFAULT_DATABASE_URL = 'localhost';

	constructor() {
		this.DB = process.env.DB || 'awe_electronics'
    this.DB_HOST = process.env.DB_HOST || this.DEFAULT_DATABASE_URL;
    this.DB_USER = process.env.DB_USER || 'root';
    this.DB_PASSWORD = process.env.DB_PASSWORD || '';
		this.CONNECTION_LIMIT = Number(process.env.CONNECTION_LIMIT) || 5;
		this.TRACE = Boolean(Number(process.env.TRACE)) || false;
		this.pool = MariaDB.createPool(
			{
				host: this.DB_HOST, 
				user: this.DB_USER, 
				database: this.DB,
				connectionLimit: this.CONNECTION_LIMIT,
				trace: this.TRACE
			}
		)
  }
}

export const config: Config = new Config()
