
import axios from 'axios';
import { UserData } from './models/User';
import { Product } from './models';

interface IAuthenticationService {
	getUser(uid: number): Promise<UserData | undefined>
	getAllUsers(): Promise<[UserData] | undefined>
	createUser(params: UserData): Promise<boolean>
	loginUser(email: string, password: string): Promise<UserData | false>
}

interface IStoreManagementService {
	getProduct(id: number): Promise<Product | undefined>
	getAllProducts(): Promise<[Product] | undefined>
	createProduct(params: Product): Promise<boolean>
	updateProduct(params: Product): Promise<boolean>
	deleteProduct(id: number): Promise<boolean>
}

const BACKEND_URL: string = "http://localhost:3000"

class Authentication implements IAuthenticationService {

	async getUser(uid: number): Promise<UserData | undefined> {
		let data: UserData | undefined
		await axios.get(`${BACKEND_URL}/user/get/${uid}`)
			.then(res => {
				data = res.data[0]
				// console.log(res.data[0])
			})
			.catch(err => err)
		return data
	}

	async getAllUsers(): Promise<[UserData] | undefined> {
		let data: [UserData] | undefined
		await axios.get(`${BACKEND_URL}/user/getAll`)
			.then(res => {
				data = res.data
				// console.log(res.data)
			})
			.catch(err => err)
		return data
	}

	async createUser(params: UserData): Promise<boolean> {
		const { account_type, first_name, last_name, address, email, password } = params;
		let initialCount: number = 0
		try {
			// Get initial user count
			const initialUsers = await this.getAllUsers();
			initialCount = initialUsers ? initialUsers.length : 0;
			console.log(`Initial user count: ${initialCount}`);

			// Start the POST request but don't await it yet
			const createUserPromise = axios.post(`${BACKEND_URL}/user/create`, {
				account_type, 
				first_name, 
				last_name, 
				address, 
				email, 
				password
			});

			// Wait for either the request to complete or 1 second, whichever comes first
			await Promise.race([
				createUserPromise,
				new Promise(resolve => setTimeout(resolve, 1000))
			]);

			// Get updated user count regardless of whether the request completed
			const updatedUsers = await this.getAllUsers();
			const updatedCount = updatedUsers ? updatedUsers.length : 0;
			console.log(`Updated user count: ${updatedCount}`);

			// Return true if the count increased, false otherwise
			return updatedCount > initialCount;

		} catch (error) {
			console.error('Error in createUser:', error);
			// Even if there was an error, check if the user was created
			const updatedUsers = await this.getAllUsers();
			const updatedCount = updatedUsers ? updatedUsers.length : 0;
			return updatedCount > initialCount;
		}
	}

	async loginUser(email: string, password: string): Promise<UserData | false> {
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

class StoreManagement implements IStoreManagementService {
	
	async getProduct(id: number): Promise<Product | undefined> {
		let data
		await axios.get(`${BACKEND_URL}/product/get/${id}`)
			.then(res => {
				data = res.data[0]
				// console.log(res.data[0])

			})
			.catch(err => err)
		return data
	}

	async getAllProducts(): Promise<[Product] | undefined> {
		let data: [Product] | undefined
		await axios.get(`${BACKEND_URL}/product/getAll`)
			.then(res => {
				data = res.data
				// console.log(res.data)

			})
			.catch(err => err)
		return data
	}

	async createProduct(params: Product): Promise<boolean> {
		const name: string = params.name
		const price: number = params.price
		const description: string = params.description
		const available: boolean = params.available
		const qty : number = params.qty
	
		let status: boolean = false
			await axios.post(`${BACKEND_URL}/product/create`, {
				name,
				price,
				description,
				available,
				qty
			})
				.then(res => {
					status = true && res.status === 200
				})
				.catch(err => err)
			
		return status
	}

	async updateProduct(product: Product): Promise<boolean> {
		// const { id, name, price, description, available, qty } = params
		console.log(product)
		let status: boolean = false
		await axios.put(`${BACKEND_URL}/product/update`, { product })
			.then(res => {
				status = true && res.status === 200
			})
			.catch(err => err)
		
		return status
	}

	async deleteProduct(id: number): Promise<boolean> {
		let status: boolean = false
		await axios.delete(`${BACKEND_URL}/product/delete/${id}`)
			.then(res => {
				status = true && res.status === 200
			})
			.catch(err => err)
		return status
	}
}

export const authentication: IAuthenticationService = new Authentication()
export const storeManagement: IStoreManagementService = new StoreManagement()
