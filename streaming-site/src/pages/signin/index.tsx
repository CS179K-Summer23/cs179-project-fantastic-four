import { useState } from 'react'
import Redirect from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Formik, Form } from 'formik'
import { object, string } from 'yup'
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import Input from '../../components/input'
import { getFirebaseApp } from '../../utils/firebase.config'
import { doc, getDoc } from "firebase/firestore";

function SignIn() {
  const [error, setError] = useState(null)
  const { auth, db } = getFirebaseApp()

  return (
    <div className="flex justify-center items-center m-6 md:m-0 flex-col h-full">
      <Head>
        <title>Sign In</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        {/*eslint-disable-next-line @next/next/no-page-custom-font*/}
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat&family=Open+Sans&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="w-full md:w-96">
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={object().shape({
            email: string().email("Invalid email").required(),
            password: string().required(),
          })}
          onSubmit={({ email, password }, { setSubmitting }) => {
            setSubmitting(true);
            setError(null);

            if (!auth) {
              console.error("Firebase auth not available");
              setSubmitting(false);
              return;
            }

            signInWithEmailAndPassword(auth, email, password)
              .then((userCredential) => {
                const docRef = doc(db, "accounts", userCredential.user.uid);

                getDoc(docRef).then((userData) => {
                  if (!userData.exists()) {
                    console.error("Firebase Error: User Account does not exist in firestore");
                    return;
                  }
                  const userId = userData.data()['id'] 
                  const isBanned = userData.data()['banned'] 

                  if(isBanned) {
                    signOut(auth)
                    const errorMessage: any = "You are currently banned."
                    setError(errorMessage)
                    setSubmitting(false)
                    return
                  }
                  return Redirect.push('/');
                })
              })
              .catch((error) => {
                let errorMessage = error.message
                if (errorMessage.includes('wrong-password')) errorMessage = 'Wrong Password'
                if (errorMessage.includes('user-not-found')) errorMessage = 'Wrong Email'
                setError(errorMessage)
                setSubmitting(false)
              })
          }}
        >
          {({ handleSubmit, isSubmitting }) => (
            <Form onSubmit={handleSubmit}>
              <div className="flex flex-col items-center">
                {/* Insert Logo Here */}
              </div>
              {error && (
                <div className="bg-red-500 text-center text-white p-2 mb-6">
                  {error}
                </div>
              )}
              <Input name="email" label="Email" autoFocus />
              <Input name="password" label="Password" type="password" />
              <div className="text-center my-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-14 md:h-10 bg-gray-700 hover:bg-gray-800 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white w-full p-4 md:p-2 buttonFont font-bold disabled:opacity-60"
                >
                  Sign In
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <div className="text-center my-6">
          <Link
            href="/reset-password"
            className="text-gray-500 hover:text-gray-600 dark:text-blue-500 dark:hover:text-blue-400"
          >
            Forgot your password?
          </Link>
        </div>

        <div className="text-center my-6">
          <Link
            href="/signup"
            className="text-gray-500 hover:text-gray-600 dark:text-blue-500 dark:hover:text-blue-400"
          >
            Don{"'"}t have an account? Sign up here.
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
