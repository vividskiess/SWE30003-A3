
import axios, { AxiosResponse } from 'axios';
import { IAddress, UserData } from '../models/User';
import { Product } from '../models';

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

interface ICreateOrder {
	status: string,
	order_date: string,
	shipping_address: string,
	shipping_cost: string,
	shipping_option: string,
	items: string
}


interface User {
	uid: string;
	account_type: string;
	first_name: string;
	last_name: string;
	gender: string;
	address: IAddress;
	email: string;
	password: string;
}

interface IAuthenticationManager {

}

interface IStoreManager {
	
}

interface IOrderManager {
	
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

	static async createUser(params: UserData): Promise<boolean> {
		const account_type: string | undefined = params.account_type
		const first_name: string | undefined = params.first_name
		const last_name: string | undefined = params.last_name
		const address: string | undefined = 'test 123'
		const email: string | undefined = params.email
		const password: string | undefined = params.password
		let status = false

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

	static async updateProduct(product: Product): Promise<void> {
		// const { id, name, price, description, available, qty } = params
		console.log(product)
		let status
		await axios.put(`${BACKEND_URL}/product/update`, { product })
			.then(res => {
				status = res
			})
			.catch(err => err)
		
		return status
	}

	static async deleteProduct(id: string): Promise<void> {
		let status
		await axios.delete(`${BACKEND_URL}/product/delete/${id}`)
			.then(res => {
				status = res
			})
			.catch(err => err)
		return status
	}

}

class Order {
	static async getOrder(id: number): Promise<void> {
		let data
		await axios.get(`${BACKEND_URL}/order/get/${id}`)
			.then(res => {
				data = res.data[0]
				// console.log(res.data[0])

			})
			.catch(err => err)
		return data
	}

	static async getAllOrders(): Promise<any> {
		let data
		await axios.get(`${BACKEND_URL}/order/getAll`)
			.then(res => {
				data = res.data
				// console.log(res.data)

			})
			.catch(err => err)
		return data
	}

		static async getAllCustomerOrders(id: string): Promise<any> {
		let data
		await axios.get(`${BACKEND_URL}/order/getAll/${id}`)
			.then(res => {
				data = res.data
				// console.log(res.data)
			})
			.catch(err => err)
		return data
	}

	static async createOrder(params: ICreateOrder): Promise<void> {
	const status: string = params.status
	const order_date: string = params.order_date
	const shipping_address: string = params.shipping_address
	const shipping_cost: string = params.shipping_cost
	const shipping_option: string = params.shipping_option
	const items: string = params.items
		await axios.post(`${BACKEND_URL}/order/create`, {
			status,
			order_date,
			shipping_address,
			shipping_cost,
			shipping_option,
			items,
		})
			.then(res => {
				console.log(res)
			})
			.catch(err => err)
	}

	static async updateOrder(params: any): Promise<void> {
		const id: string = params.name
		const property: string = params.property
		const value: string = params.value 

		await axios.post(`${BACKEND_URL}/order/update/${id}/${property}`, {
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
	StoreManagement,
	Order
}
