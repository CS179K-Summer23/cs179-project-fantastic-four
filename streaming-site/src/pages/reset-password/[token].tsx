// import { useState } from 'react';
import Redirect, { useRouter } from 'next/router'
import { Formik, Form } from 'formik'
import { object, string } from 'yup'
import Input from '../../components/input'

function ResetPasswordToken(): JSX.Element {
  const router = useRouter()
  const { token } = router?.query

  return (
    <div className="flex justify-center items-center m-6 md:m-0 flex-col h-full">
      <div className="w-full md:w-96">

        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={object().shape({
            password: string().min(8).required(),
            confirmPassword: string().required(),
          })}
          validate={({ password, confirmPassword }) => {
            if (password !== confirmPassword) {
              return {
                confirmPassword: 'Passwords must match.',
              }
            }

            return {}
          }}
          onSubmit={(values, { setSubmitting }) => {
            Redirect.push('/signin');
          }}
        >
          {({ handleSubmit }): JSX.Element => (
            <Form onSubmit={handleSubmit}>
              <div className="flex flex-col items-center">
                
              </div>
              <Input name="password" label="Password" type="password" />
              <Input name="confirmPassword" label="Confirm Password" type="password" />
              <div className="text-center my-6">
                <button type="submit" className="h-14 md:h-10 bg-gray-700 hover:bg-gray-800 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white w-full p-4 md:p-2">
                  Reset Password
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default ResetPasswordToken
