InputsService = {}
local callbackOfCurrentOpenInput = nil

InputsService.CloseInput = function(callback)
    callbackOfCurrentOpenInput = nil
    SetNuiFocus(false, false)
    if callback ~= nil then
        callback({ success = true }) -- All RegisterNUICallback MUST have a callback, even if it's empty which allows the client to continue
    end
end

---@param result table
InputsService.CallCallbackAndCloseInput = function(result, callback)
    local resultText = result.stringtext or nil

    if resultText ~= nil then
        callbackOfCurrentOpenInput(resultText)
    end

    Wait(1)

    InputsService.CloseInput(callback)
end

---@param result table
InputsService.SetSubmit = function(result, callback)
    InputsService.CallCallbackAndCloseInput(result, callback)
end

---@param result table
InputsService.SetClose = function(result)
    --TODO At which point will this method be called? Is it correct to set result.resultText and call callback?
    InputsService.CallCallbackAndCloseInput(result)
end

---@param title string
---@param placeHolder string
---@param callback function
InputsService.GetInputs = function(title, placeHolder, callback)
    InputsService.WaitForInputs(title, placeHolder, callback)
end

---@param title string
---@param placeHolder string
---@param inputType string
---@param callback function
InputsService.GetInputsWithInputType = function(title, placeHolder, inputType, callback)
    InputsService.WaitForInputs(title, placeHolder, callback, inputType)
end

---@param inputConfig string
---@param callback function
InputsService.OnAdvancedInput = function(inputConfig, callback)
    SetNuiFocus(true, true)
    SendNUIMessage(json.decode(inputConfig))
    callbackOfCurrentOpenInput = callback
end

---@param button string
---@param placeHolder string
---@param cb function
---@param inputType string? "input" or "textarea" (default: "input")
InputsService.WaitForInputs = function(button, placeHolder, cb, inputType)
    inputType = inputType or "input" or "textarea"

    SetNuiFocus(true, true)
    SendNUIMessage(NUIEvent:New({
        style = "block",
        button = button,
        placeholder = placeHolder,
        inputType = inputType,
    }))

    callbackOfCurrentOpenInput = cb
end
