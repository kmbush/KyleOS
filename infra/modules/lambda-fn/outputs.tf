output "function_name" {
  description = "Name of the created function."
  value       = aws_lambda_function.this.function_name
}

output "route_key" {
  description = "The HTTP API route this function serves."
  value       = aws_apigatewayv2_route.this.route_key
}
