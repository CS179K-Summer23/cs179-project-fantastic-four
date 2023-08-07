//import { useState } from 'react';
import Link from 'next/link'
import { Formik, Form } from 'formik'
import { object, string } from 'yup'
import Input from '../../components/input'

function ResetPasswordIndex(): JSX.Element {
  const isDarkMode = typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <div className="flex justify-center items-center m-6 md:m-0 flex-col h-full">
      <div className="w-full md:w-96">

        <Formik
          initialValues={{ email: '' }}
          validationSchema={object().shape({
            email: string().email('Invalid email').required(),
          })}
          onSubmit={(values, { setSubmitting }) => {

          }}
        >
          {({ handleSubmit }): JSX.Element => (
            <Form onSubmit={handleSubmit}>
              <div className="flex flex-col items-center">
                {/* Insert Logo Here */}
              </div>
              <Input name="email" label="Email" autoFocus />
              <div className="text-center my-6">
                <button type="submit" className="h-14 md:h-10 bg-gray-700 hover:bg-gray-800 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white w-full p-4 md:p-2">
                  Send Reset Password Email
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <div className="text-center my-8">
          <Link href="/signin" className="text-gray-500 hover:text-gray-600 dark:text-blue-500 dark:hover:text-blue-400">
              Remember your password? Sign in here.
          </Link>
        </div>

      </div>
    </div>
  )
}

export default ResetPasswordIndex
