import { Field } from 'formik';
import { string, bool } from 'prop-types';
import styled from 'tailwind-styled-components';

const StyledInput = styled.input`
  mt-2
  p-2 md:p-1.5
  w-full
  dark:bg-gray-800
  text-gray-800 dark:text-white
  outline-none
  border dark:border-blue-400 border-gray-300
  dark:focus:border-blue-500 focus:border-gray-500
  text-center
`;

interface InputProps {
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  autoFocus?: boolean;
}

interface FieldProps {
  field: {
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };

  form: {
    errors: { [key: string]: string };
    touched: { [key: string]: boolean };
    isSubmitting: boolean;
  };
}

function Input({ type, name, label, ...rest }: InputProps): JSX.Element {
  return (
    <Field type={type} name={name}>
      {({ field, form }: FieldProps): JSX.Element => (
        <div className="text-center my-4">
          <label className="text-gray-800 dark:text-white" htmlFor={name}>
            {label}
          </label>
          <StyledInput
            type={type}
            name={name}
            value={field.value}
            onChange={field.onChange}
            disabled={form.isSubmitting}
            {...rest}
          />
          {form.touched[field.name] && form.errors[field.name] && <div className="text-red-500 dark:text-red-400 mt-2">{form.errors[field.name]}</div>}
        </div>
      )}
    </Field>
  );
}

Input.defaultProps = {
  type: 'text',
  placeholder: '',
  autoFocus: false,
};

Input.propTypes = {
  type: string,
  name: string.isRequired,
  label: string.isRequired,
  placeholder: string,
  autoFocus: bool,
};

export default Input;
