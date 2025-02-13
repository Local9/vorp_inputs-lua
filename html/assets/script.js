class Field {
  constructor(fieldData) {
    this.inputType = fieldData.inputType ?? "input"; // input type (default: input)
    this.buttonText = fieldData.button ?? "confirm"; // button text (default: confirm)
    this.placeholder = fieldData.placeholder ?? "Enter a value"; // placeholder text (default: Enter a value)
    this.attributes = fieldData.attributes ?? { // input attributes (default: as below)
      "inputHeader": "",
      "required": true,
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

  setAttributes(headerElement) {
    for (const key in this.attributes) {
      if (key === "inputHeader") {
        headerElement.innerHTML = this.attributes[key];
        headerElement.style.display = "block";
      } else if (key === "required" && this.attributes[key] === true) {
        this.element.required = "required";
      } else {
        this.element.setAttribute(`${key}`, `${this.attributes[key]}`);
      }
    }
  }
}

let myField = new Field({});

function InvalidMessageHandler(field) {
  if (field.validity.valueMissing) {
    field.setCustomValidity(myField.errors?.valueMissing);
  } else if (field.validity.tooShort) {
    field.setCustomValidity(myField.errors?.tooShort);
  } else if (field.validity.tooLong) {
    field.setCustomValidity(myField.errors?.tooLong);
  } else if (field.validity.patternMismatch) {
    field.setCustomValidity(myField.errors?.patternMismatch);
  } else if (field.validity.typeMismatch) {
    field.setCustomValidity(myField.errors?.typeMismatch);
  } else {
    field.setCustomValidity(""); // clear error message
  }
}

function ToggleInputToDisplay(type, inputElement, textareaElement) {
  if (type == "textarea") {
    textareaElement.focus();
    inputElement.style.display = "none";
    textareaElement.style.display = "unset";
  } else if (type == "input") {
    inputElement.focus();
    inputElement.style.display = "unset";
    textareaElement.style.display = "none";
  } else {
    console.error("Unknown input type: " + type);
  }
}

function CloseInput() {
  myField = new Field({}); // reset field data
  document.body.style.display = "none"; // hide input
  // send close event to NUI
  fetch("https://vorp_inputs/close", { method: "POST", body: JSON.stringify({ stringtext: "close" }) })
    .then((response) => { })
    .catch((error) => { console.error("NUI Close Error:", error); });
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
        myField.element.placeholder = myField.placeholder;

        ToggleInputToDisplay(myField.inputType, inputContainer, textareaContainer);

        myField.setAttributes(inputHeaderEle);
      }
    } else {
      console.error("Unknown type: " + event.data.type);
    }
  });

  document.onkeyup = function (data) {
    if (data.key == "Escape") {
      CloseInput();
    }
  };

  $("#closeButton").click(function () {
    CloseInput();
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

    fetch("https://vorp_inputs/submit", { method: "POST", body: JSON.stringify({ stringtext: fieldValue }) })
      .then((response) => { CloseInput(); })
      .catch((error) => { console.error("NUI Submit Error:", error); })
  });
});
