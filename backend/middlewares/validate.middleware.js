/**
 * Validation sources that can be validated
 */
const VALIDATION_SOURCES = {
    BODY: 'body',
    QUERY: 'query',
    PARAMS: 'params'
};

/**
 * Formats Zod validation errors into a consistent structure
 * @param {import('zod').ZodError} zodError - The Zod error object
 * @returns {Array<{field: string, message: string, code: string}>}
 */
const formatZodErrors = (zodError) => {
    return zodError.errors.map((err) => ({
        field: err.path.length > 0 ? err.path.join('.') : '_root',
        message: err.message,
        code: err.code
    }));
};

/**
 * Creates a validation middleware for the request body
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {import('express').RequestHandler}
 */
export const validate = (schema) => {
    if (!schema || typeof schema.safeParse !== 'function') {
        throw new Error('validate middleware requires a valid Zod schema');
    }

    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: formatZodErrors(result.error)
                });
            }

            req.body = result.data;
            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Internal validation error',
                errors: [{ field: '_internal', message: 'An unexpected error occurred during validation', code: 'internal_error' }]
            });
        }
    };
};

/**
 * Creates a validation middleware that can validate body, query, and/or params
 * @param {Object} schemas - Object containing schemas for different sources
 * @param {import('zod').ZodSchema} [schemas.body] - Schema for request body
 * @param {import('zod').ZodSchema} [schemas.query] - Schema for query parameters
 * @param {import('zod').ZodSchema} [schemas.params] - Schema for route parameters
 * @returns {import('express').RequestHandler}
 */
export const validateRequest = (schemas = {}) => {
    if (!schemas || typeof schemas !== 'object') {
        throw new Error('validateRequest middleware requires a schemas object');
    }

    const { body, query, params } = schemas;

    // Validate that at least one schema is provided
    if (!body && !query && !params) {
        throw new Error('validateRequest requires at least one schema (body, query, or params)');
    }

    // Validate that provided schemas are valid Zod schemas
    Object.entries(schemas).forEach(([key, schema]) => {
        if (schema && typeof schema.safeParse !== 'function') {
            throw new Error(`Invalid Zod schema provided for "${key}"`);
        }
    });

    return (req, res, next) => {
        try {
            const allErrors = [];

            // Validate body
            if (body) {
                const result = body.safeParse(req.body);
                if (!result.success) {
                    allErrors.push(...formatZodErrors(result.error).map(err => ({ ...err, source: VALIDATION_SOURCES.BODY })));
                } else {
                    req.body = result.data;
                }
            }

            // Validate query
            if (query) {
                const result = query.safeParse(req.query);
                if (!result.success) {
                    allErrors.push(...formatZodErrors(result.error).map(err => ({ ...err, source: VALIDATION_SOURCES.QUERY })));
                } else {
                    req.query = result.data;
                }
            }

            // Validate params
            if (params) {
                const result = params.safeParse(req.params);
                if (!result.success) {
                    allErrors.push(...formatZodErrors(result.error).map(err => ({ ...err, source: VALIDATION_SOURCES.PARAMS })));
                } else {
                    req.params = result.data;
                }
            }

            if (allErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: allErrors
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Internal validation error',
                errors: [{ field: '_internal', message: 'An unexpected error occurred during validation', code: 'internal_error' }]
            });
        }
    };
};

/**
 * Validates that req.params contains a valid MongoDB ObjectId
 * @param {string} paramName - The name of the param to validate (default: 'id')
 * @returns {import('express').RequestHandler}
 */
export const validateObjectId = (paramName = 'id') => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    return (req, res, next) => {
        try {
            const id = req.params[paramName];

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: [{ field: paramName, message: `${paramName} is required`, code: 'required', source: VALIDATION_SOURCES.PARAMS }]
                });
            }

            if (!objectIdRegex.test(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: [{ field: paramName, message: `Invalid ${paramName} format`, code: 'invalid_format', source: VALIDATION_SOURCES.PARAMS }]
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Internal validation error',
                errors: [{ field: '_internal', message: 'An unexpected error occurred during validation', code: 'internal_error' }]
            });
        }
    };
};