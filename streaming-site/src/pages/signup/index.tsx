import { useState, useEffect } from 'react'
import Redirect from 'next/router'
import Link from 'next/link'
import { Formik, Form } from 'formik'
import { object, string } from 'yup'
import Input from '../../components/input'

function Signup(): JSX.Element {
  const [errorMessage, setErrorMessage] = useState('')

  return (
    <div className="flex justify-center items-center m-6 md:m-0 flex-col h-full">
      <div className="w-full md:w-96">
        <Formik
          initialValues={{ name: '', email: '', password: '' }}
          validationSchema={object().shape({
            name: string().required(),
            email: string().email('Invalid email').required(),
            password: string().min(8).required(),
          })}
          onSubmit={({ name, email, password }, { setSubmitting }) => {

          }}
        >
          {({ handleSubmit }): JSX.Element => (
            <Form onSubmit={handleSubmit}>
              <div className="flex flex-col items-center">

              </div>
              {errorMessage && (<div className="p-2 mb-4 bg-red-500 text-white text-center">{errorMessage}</div>)}
              <Input name="name" label="Name" autoFocus />
              <Input name="email" label="Email" />
              <Input name="password" label="Password" type="password" />
              <div className="text-center my-6">
                <button type="submit" className="h-14 md:h-10 bg-gray-700 hover:bg-gray-800 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white w-full p-4 md:p-2">
                  Sign Up
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <div className="text-center my-8">
          <Link href="/signin" className="text-gray-500 hover:text-gray-600 dark:text-blue-500 dark:hover:text-blue-400">
              Already have an account? Sign in here.
          </Link>
        </div>

      </div>
    </div>
  )
}

export default Signup
