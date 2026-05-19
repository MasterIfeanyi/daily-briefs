import PropTypes from 'prop-types';
import { cn } from '@/utils/t-merge';

function Form({ className, onSubmit, ...props }) {
	return (
		<form
			data-slot="form"
			className={cn("w-full space-y-4", className)}
			onSubmit={onSubmit}
			{...props}
		/>
	);
}

Form.propTypes = {
	className: PropTypes.string,
	onSubmit: PropTypes.func,
	children: PropTypes.node,
};


function FormField({ className, error, required, ...props }) {
	return (
		<div
			data-slot="form-field"
			className={cn("w-full space-y-2", className)}
			aria-required={required}
			aria-invalid={!!error}
			{...props}
		/>
	);
}

FormField.propTypes = {
	className: PropTypes.string,
	error: PropTypes.string,
	required: PropTypes.bool,
	children: PropTypes.node,
};


function FormLabel({ className, required, children, ...props }) {
	return (
		<label
			data-slot="form-label"
			className={cn(
				"text-foreground text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
				className
			)}
			{...props}
		>
			{children}
			{required && (
				<span className="text-destructive ml-1" aria-label="required">
					*
				</span>
			)}
		</label>
	);
}

FormLabel.propTypes = {
	className: PropTypes.string,
	required: PropTypes.bool,
	children: PropTypes.node.isRequired,
};


function FormMessage({ className, error, ...props }) {
	if (!props.children) return null;

	return (
		<p
			data-slot="form-message"
			className={cn(
				"text-muted-foreground text-xs leading-tight",
				error && "text-destructive font-medium",
				className
			)}
			role={error ? "alert" : undefined}
			aria-live={error ? "polite" : undefined}
			{...props}
		/>
	);
}

FormMessage.propTypes = {
	className: PropTypes.string,
	error: PropTypes.bool,
	children: PropTypes.node,
};


function FormDescription({ className, ...props }) {
	return (
		<p
			data-slot="form-description"
			className={cn("text-muted-foreground text-xs leading-tight", className)}
			{...props}
		/>
	);
}

FormDescription.propTypes = {
	className: PropTypes.string,
	children: PropTypes.node,
};


export { Form, FormField, FormLabel, FormMessage, FormDescription };