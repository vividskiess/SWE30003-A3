
import axios, { AxiosResponse } from 'axios';

interface ICreateUser {
	account_type: string, 
	first_name: string,
	last_name: string,
	address: string,
	email: string, 
	password: string
}

interface ICreateProduct {
	name: string,
	price: string,
	description: string,
	available: string
}

interface User {
	uid: string;
	account_type: string;
	first_name: string;
	last_name: string;
	gender: string;
	address: string;
	email: string;
	password: string;
}


const BACKEND_URL: string = "http://localhost:3000"

class Authentication {
	static async getUser(uid: number): Promise<void> {
		let data
		await axios.get(`${BACKEND_URL}/user/get/${uid}`)
			.then(res => {
				data = res.data[0]
				// console.log(res.data[0])
			})
			.catch(err => err)
		return data
	}

	static async getAllUsers(): Promise<any> {
		let data
		await axios.get(`${BACKEND_URL}/user/getAll`)
			.then(res => {
				data = res.data
				// console.log(res.data)
			})
			.catch(err => err)
		return data
	}

	static async createUser(params: ICreateUser): Promise<boolean> {
		const account_type: string = params.account_type
		const first_name: string = params.first_name
		const last_name: string = params.last_name
		const address: string = params.address
		const email: string = params.email
		const password: string = params.password
		
		let status = false
		
		await axios.get(`${BACKEND_URL}/user/getEmail/${email}`)
			.then(res => {
				if (res.data[0].email !== email) status = true
			})
			.catch(err => err)

		if(!status) return status

		await axios.post(`${BACKEND_URL}/user/create`, {
			account_type, 
			first_name, 
			last_name, 
			address, 
			email, 
			password
		})
			.then(res => {
				console.log(res)
				status = true
			})
			.catch(err => err)
		return status
	}

	static async loginUser(email: string, password: string): Promise<User | false> {
		let data = false
		await axios.get(`${BACKEND_URL}/user/getEmail/${email}`)
			.then(res => {
				if (res.data[0].password === password) data = res.data[0]
				else data = false
			})
			.catch(err => err)
		return data
	}
	

	// static updateUser(uid: number, property: string): void {
	// 	axios.get(`${BACKEND_URL}/user/get/${uid}`).then((res) => {
			
	// 	})
	// }
}

class StoreManagement {
	
	static async getProduct(id: number): Promise<void> {
		let data
		await axios.get(`${BACKEND_URL}/product/get/${id}`)
			.then(res => {
				data = res.data[0]
				// console.log(res.data[0])

			})
			.catch(err => err)
		return data
	}

	static async getAllProducts(): Promise<any> {
		let data
		await axios.get(`${BACKEND_URL}/product/getAll`)
			.then(res => {
				data = res.data
				// console.log(res.data)

			})
			.catch(err => err)
		return data
	}

	static async createProduct(params: ICreateProduct): Promise<void> {
	const name: string = params.name
	const price: string = params.price
	const description: string = params.description
	const available: string = params.available
		
		await axios.post(`${BACKEND_URL}/product/create`, {
			name,
			price,
			description,
			available,
		})
			.then(res => {
				console.log(res)
			})
			.catch(err => err)
	}

	static async updateProduct(params: any): Promise<void> {
		const id: string = params.name
		const property: string = params.property
		const value: string = params.value 

		await axios.post(`${BACKEND_URL}/product/update/${id}/${property}`, {
			id, property, value
		})
			.then(res => {
				console.log(res)
			})
			.catch(err => err)
	}
}

export {
	Authentication,
	StoreManagement
}
