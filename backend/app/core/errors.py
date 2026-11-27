from flask import jsonify

def register_error_handlers(app):
    """Registers standard HTTP error handlers compliant with RFC 7807."""
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'status': 400,
            'error': 'Bad Request',
            'message': getattr(error, 'description', 'The request could not be understood or was missing required parameters.')
        }), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'status': 401,
            'error': 'Unauthorized',
            'message': getattr(error, 'description', 'Authentication credentials are required or invalid.')
        }), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'status': 403,
            'error': 'Forbidden',
            'message': getattr(error, 'description', 'You do not have permission to access this resource.')
        }), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'status': 404,
            'error': 'Not Found',
            'message': getattr(error, 'description', 'The requested resource was not found.')
        }), 404

    @app.errorhandler(429)
    def rate_limit(error):
        return jsonify({
            'status': 429,
            'error': 'Too Many Requests',
            'message': getattr(error, 'description', 'Too many requests. Please try again later.')
        }), 429

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'status': 500,
            'error': 'Internal Server Error',
            'message': 'An unexpected server error occurred.'
        }), 500

