import * as FormPrimitive from 'formsnap';
import Description from './form-description.svelte';
import Label from './form-label.svelte';
import FieldErrors from './form-field-errors.svelte';
import Field from './form-field.svelte';
import Fieldset from './form-fieldset.svelte';
import Button from './form-button.svelte';

const Control = FormPrimitive.Control;

export {
	Field,
	Control,
	Label,
	Button,
	FieldErrors,
	Description,
	Fieldset,
	Field as FormField,
	Control as FormControl,
	Description as FormDescription,
	Label as FormLabel,
	FieldErrors as FormFieldErrors,
	Fieldset as FormFieldset,
	Button as FormButton
};
