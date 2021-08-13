import API from '../../API';

export const Register = () => {
    const button = "cursor-pointer text-center max-w-full bg-transparent hover:bg-purple-500 text-purple-700 font-semibold hover:text-white py-2 px-4 border border-purple-500 hover:border-transparent rounded";
    const inputStyle = "mb-10 mx-10 bg-purple-200";

    const enterSubmit = async (e) => {
        if(e.keyCode === 13) {
            e.preventDefault();
            await submitForm();
        }
    };

    const submitForm = async () => {
        const nameElement = document.getElementById("name") as HTMLInputElement;
        const emailElement = document.getElementById("email") as HTMLInputElement;
        
        const usernameElement = document.getElementById("username") as HTMLInputElement;
        const passwordElement = document.getElementById("password") as HTMLInputElement;

        const error = document.getElementById("error");

        if(nameElement && emailElement && usernameElement && passwordElement && error) {
            const name = nameElement.value;
            const email = emailElement.value;

            const username = usernameElement.value;
            const password = passwordElement.value;

            error.innerHTML = "";

            if(name && email && username && password) {
                var data = await API.createUser(name, email, username, password);

                if(data.success) {
                    sessionStorage.removeItem("VideoState");

                    window.location.pathname = "/user/login";
                } else {
                    for(var i = 0; i < data.error.length; i++) {
                        error.innerHTML += "<p>" + data.error[i].msg + "</p>";
                    }

                    error.style.display = "block";
                }
            } else {
                error.innerText = "Please fill in all fields";
                    error.style.display = "block";
            }
        }
    };

    return (
        <>
            <div className="mx-auto w-1/4 border border-purple-500 text-purple-700 hidden" id="error"></div>
            <div className="grid grid-cols-2 text-purple-500 mx-auto my-20 sm:w-3/4 lg:w-1/2">
                <label>Name</label>
                <input className={inputStyle} type="text" id="name" onKeyUp={e => enterSubmit(e)}/>
                <label>Email</label>
                <input className={inputStyle} type="text" id="email" onKeyUp={e => enterSubmit(e)}/>
                <label>Username</label>
                <input className={inputStyle} type="text" id="username" onKeyUp={e => enterSubmit(e)}/>
                <label>Password</label>
                <input className={inputStyle} type="password" id="password" onKeyUp={e => enterSubmit(e)}/>
                <a className={button + " mr-10"} href="/user/login">Back</a>
                <a className={button} onClick={submitForm}>Register</a>
            </div>
        </>
    )
}
