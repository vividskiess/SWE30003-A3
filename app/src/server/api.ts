
import axios from 'axios';


class Authentication {

	private static BACKEND_URL: string = "http://localhost:1234"

	static test(): void {
		// console.log("test")
		axios.get(`${Authentication.BACKEND_URL}/`)
			.then(res => res)
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
