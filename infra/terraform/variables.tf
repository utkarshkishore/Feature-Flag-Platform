variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "feature-flag"
}

variable "frontend_image" {
  type = string
}

variable "backend_image" {
  type = string
}

variable "acm_certificate_arn" {
  type = string
}

variable "db_username" {
  type = string
}

variable "db_password" {
  type = string
}

variable "db_name" {
  type    = string
  default = "featureflag"
}

variable "jwt_secret" {
  type = string
}

variable "jwt_refresh_secret" {
  type = string
}
