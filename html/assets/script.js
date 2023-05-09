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
}

let fieldData = {};

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

$(function () {
  window.addEventListener("message", function (event) {
    if (event.data.type == "enableinput") {
      const field = new Field(event.data);

      document.body.style.display = field.style;

      const inputEle = document.getElementById("inputUser");
      const inputHeaderEle = document.getElementById("inputHeader");
      const buttonEle = document.getElementById("submitButton");
      const inputContainer = document.getElementById("vorpSingleInput");
      const textareaContainer = document.getElementById("vorpTextarea");

      inputHeaderEle.style.display = "none";

      if (field.style == "block") {
        buttonEle.innerHTML = field.buttonText;
        inputEle.placeholder = field.placeholder;
        inputEle.value = field?.attributes?.value ?? "";

        if (field.inputType == "textarea") {
          textareaContainer.style.display = "unset";
          inputContainer.style.display = "none";
          inputEle = document.getElementById("inpTextarea");
        } else if (field.inputType == "input") {
          textareaContainer.style.display = "none";
          inputContainer.style.display = "inline";
        }

        for (const key in field?.attributes) {
          if (key === "inputHeader") {
            inputHeaderEle.innerHTML = field.attributes[key];
            inputHeaderEle.style.display = "block";
          } else if (key === "required") {
            inputEle.required = field.attributes[key];
          } else {
            inputEle.setAttribute(`${key}`, `${field.attributes[key]}`);
          }
        }
      }
    } else {
      console.error("Unknown type: " + event.data.type);
    }
  });

  document.onkeyup = function (data) {
    if (data.which == 27) {
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
    //event.preventDefault(); // Prevent form from submitting

    let fieldValue = $("#inputUser").val();

    if ($("#vorpTextarea").is(":visible")) {
      fieldValue = $("#inpTextarea").val();
    }

    $.post(
      "http://vorp_inputs/submit",
      JSON.stringify({
        stringtext: fieldValue,
      })
    );
  });
});
