
import axios, { AxiosResponse } from 'axios';


class Authentication {

	private static BACKEND_URL: string = "http://localhost:3000"

	static test(): any {
		let data
		axios.get(`${Authentication.BACKEND_URL}/user/getAll`)
			.then(res => {
				data = res
				console.log(res)
				return data
			})
			.catch(err => err)
		
		
	}

	static register_new_user(): void {
		axios.get(Authentication.BACKEND_URL).then((res) => {
			console.log(res)
		})
	}

	static login_user(uid: number): void {
		axios.get(`${Authentication.BACKEND_URL}/user/get/${uid}`).then((res) => {
			
		})
	}
}

export default Authentication
