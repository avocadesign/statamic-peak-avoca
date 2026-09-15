---
title: Form
description: A form built under Forms in the control panel, with an optional heading, short text and contact details beside it.
---
## When to use

- Letting people get in touch, ask for a quote or make an enquiry without leaving the page.
- A contact page, or the end of a service page where people are ready to ask about the service.
- Add a heading, and a sentence on what happens after someone sends the form, such as when they can expect a reply.
- Switch on Include contact details to show the phone, email or address from Site Details beside the form, for people who would rather call or email.

## When not to use

- Contact details with no form: use the Contact Details set in a Text block.
- Sending people to a booking or payment system on another website: use Call to action, or the Buttons set, with a link to it.
- A newsletter sign-up from an email marketing service: use the HTML set with the service's own embed code, because this block only shows forms built on this site.

## Notes for AI

- Forms are built under Forms in the control panel, not in this block. Choose an existing form by its handle, such as `contact`, and ask for a new form to be built when none fits.
- Use one Form block per page. Its field IDs come from the form's field handles and its error summary always has the ID `summary`, so a second form on the page sends labels, error links and focus to the first.
- Always write a heading, such as "Get in touch". It shows as a level-two heading.
- Keep the text to one or two sentences. It is plain text, so it can't hold links or formatting, but line breaks show.
- The submit button's label and the messages people see after sending come from the site's language strings, not the block, so don't repeat them in the text.
- With Include contact details on, tick at least one detail that has a value in Site Details, or the column beside the form is empty. The details take a third of the width beside the form, and sit below it on phones.
- The form needs the site's server, which checks each answer as people fill the form in, verifies the captcha and receives the submission. It doesn't work on a site generated as static files, so don't add it there: ask the developer how that site takes enquiries.
- The captcha only checks forms listed in the site's captcha settings, and the kit lists only the Contact form. Tell the developer when a page uses any other form.
