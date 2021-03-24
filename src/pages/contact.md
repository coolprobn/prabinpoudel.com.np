---
title: "Contact"
path: /contact/
date: 2020-04-18
excerpt: "Preferred methods of sending your questions, inquires, messages, and love letters to me."
---

Want to discuss your next project with me? Just send me the details using the form below.

<form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field">
  <div class="form-group">
    <label for="name">Name
      <input id="name" name="name" type="text" spellcheck="false" maxlength="255" required>
    </label>
  </div>
  <div class="form-group">
    <label for="email">Email address <small>(will remain private)</small>
      <input id="email" name="email" type="email" spellcheck="false" maxlength="255" required pattern="[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?">
    </label>
  </div>
  <div class="form-group">
    <label for="message">Message
      <textarea id="message" name="message" spellcheck="true" rows="10" cols="50" required></textarea>
    </label>
  </div>
  <div class="form-group">
    <label for="reference">How&rsquo;d you hear about my website?
      <input id="reference" name="reference" type="text" maxlength="255" placeholder="e.g. Searching the web">
    </label>
  </div>
  <div class="form-group">
    <button id="saveForm" name="saveForm" class="btn submit" type="submit">Send message</button>
  </div>
</form>
