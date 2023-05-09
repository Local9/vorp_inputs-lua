class Field {
  constructor(fieldData) {
    this.inputType = fieldData.inputType ?? "input"; // input type (default: input)
    this.buttonText = fieldData.button ?? "confirm"; // button text (default: confirm)
    this.placeholder = fieldData.placeholder ?? "Enter a value"; // placeholder text (default: Enter a value)
    this.attributes = fieldData.attributes ?? { // input attributes (default: as below)
      "inputHeader": "",
      "required": false,
      "value": "",
      "minlength": 0,
      "maxlength": 255,
      "pattern": "",
      "title": "",
      "autocomplete": "off",
      "autofocus": true,
      "disabled": false,
    };
    this.errors = fieldData.errors ?? { // input errors (default: as below)
      "valueMissing": "Please enter a value",
      "tooShort": "Value is too short",
      "tooLong": "Value is too long",
      "patternMismatch": "Value is invalid",
      "typeMismatch": "Value is invalid type",
    };
  }

  type = "enableinput";
  style = "block";

  inputType = "";
  buttonText = "";
  placeholder = "";
  attributes = {};
  errors = {};

  element = null;

  setAttributes(fieldElement, headerElement) {
    for (const key in this.attributes) {
      if (key === "inputHeader") {
        headerElement.innerHTML = this.attributes[key];
        headerElement.style.display = "block";
      } else if (key === "required") {
        fieldElement.required = this.attributes[key];
      } else {
        fieldElement.setAttribute(`${key}`, `${this.attributes[key]}`);
      }
    }
  }
}

let myField = new Field({});

function InvalidMessageHandler(field) {
  if (field.validity.valueMissing) {
    field.setCustomValidity(errors?.valueMissing);
  } else if (field.validity.tooShort) {
    field.setCustomValidity(errors?.tooShort);
  } else if (field.validity.tooLong) {
    field.setCustomValidity(errors?.tooLong);
  } else if (field.validity.patternMismatch) {
    field.setCustomValidity(errors?.patternMismatch);
  } else if (field.validity.typeMismatch) {
    field.setCustomValidity(errors?.typeMismatch);
  } else {
    field.setCustomValidity(""); // clear error message
  }
}

function ToggleInputToDisplay(type, inputElement, textareaElement) {
  if (type == "textarea") {
    inputElement.style.display = "none";
    textareaElement.style.display = "unset";
  } else if (type == "input") {
    inputElement.style.display = "unset";
    textareaElement.style.display = "none";
  } else {
    console.error("Unknown input type: " + type);
  }
}

$(function () {
  window.addEventListener("message", function (event) {
    if (event.data.type == "enableinput") {
      myField = new Field(event.data);

      document.body.style.display = myField.style;

      myField.element = myField.inputType === "textarea" ? document.getElementById("inpTextarea") : document.getElementById("inputUser");
      const inputHeaderEle = document.getElementById("inputHeader");
      const buttonEle = document.getElementById("submitButton");
      const inputContainer = document.getElementById("vorpSingleInput");
      const textareaContainer = document.getElementById("vorpTextarea");

      inputHeaderEle.style.display = "none";

      if (myField.style == "block") {
        buttonEle.innerHTML = myField.buttonText;
        inputEle.placeholder = myField.placeholder;

        ToggleInputToDisplay(myField.inputType, inputContainer, textareaContainer);

        myField.setAttributes(myField.element, inputHeaderEle);
      }
    } else {
      console.error("Unknown type: " + event.data.type);
    }
  });

  document.onkeyup = function (data) {
    if (data.key == "Escape") {
      // Escape key
      $.post(
        "http://vorp_inputs/close",
        JSON.stringify({
          stringtext: "close",
        })
      );
    }
  };

  $("#closeButton").click(function () {
    $.post(
      "http://vorp_inputs/close",
      JSON.stringify({
        stringtext: "close",
      })
    );
  });

  $("#formInputs").submit(function (event) {
    event.preventDefault();
    const element = myField.element;
    let fieldValue = element.value;

    if (!element.checkValidity()) {
      InvalidMessageHandler(element);
      element.reportValidity();
      return;
    }

    fetch("http://vorp_inputs/submit", { method: "POST", body: JSON.stringify({ stringtext: fieldValue }) });
  });
});
