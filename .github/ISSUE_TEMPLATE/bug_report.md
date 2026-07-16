---
name: Bug report
description: Report an issue with the API or framework
labels: [bug]
body:
  - type: input
    id: endpoint
    attributes:
      label: Base URL & model
      placeholder: e.g. https://www.aifast.club/v1, claude-sonnet-5
    validations:
      required: true
  - type: textarea
    id: description
    attributes:
      label: What happened?
      placeholder: Include the HTTP status, response body (redact API key), and error message.
    validations:
      required: true
  - type: dropdown
    id: capability
    attributes:
      label: Capability
      options: [text, streaming, tools, image, video, embedding]
