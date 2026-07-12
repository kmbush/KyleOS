# Verified sender and recipient identities for the contact form. May start in the SES
# sandbox, where both ends must be verified (DESIGN §11). post_contact is scoped to
# send only from the sender identity (lambda.tf).

resource "aws_ses_email_identity" "sender" {
  email = var.contact_sender_email
}

resource "aws_ses_email_identity" "recipient" {
  email = var.contact_recipient_email
}
