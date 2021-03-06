// ************************************************************************************************************
// Written by Alexander Agudelo <alex.agudelo@asurantech.com>, 2017
// Date: 03/Jan/2017
// Description: Low Pass Filter. 
//
// Original LPF Library: https://github.com/uhho/LPF
// ------
// Copyright (C) Asuran Technologies - All Rights Reserved
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential.
// ************************************************************************************************************
define(['HubLink', 'RIB', 'PropertiesPanel', 'Easy'], function(Hub, RIB, Ppanel, easy) {
  var actions = ["Filter"];
  var inputs = ["Filtered"];
  var _objects = {};
  var LowPassFilter = {
    settings:{
      Custom: {}
    },
    dataFeed: {}
  };

  // TODO: Review if this is a trully unique instance?

  LowPassFilter.getActions = function() {
    return actions;
  };

  LowPassFilter.getInputs = function() {
    return inputs;
  };

  /**
   * Use this method to control the visibility of the DataFeed
   * By default it will show() the DataFeed, change it to true due to hide it. 
   */
  LowPassFilter.hideDataFeed = function() {
    return true;
  };

  /**
   * Triggered when added for the first time to the side bar.
   * This script should subscribe to all the events and broadcast
   * to all its copies the data.
   * NOTE: The call is bind to the block's instance, hence 'this'
   * does not refer to this module, for that use 'LowPassFilter'
   */
  LowPassFilter.onLoad = function(){
    this._settingsSet = false;
    var that = this;
    
    // Load my properties template
    this.loadTemplate('properties.html').then(function(template){
      that.propTemplate = template;
    });


    // Load Dependencies
    var libPath = this.basePath + 'lib/';
    require([libPath+'LPF.js'], function(lpf){
      that._LPF = lpf;
      console.log("LPF library loaded");
      // If there were settings saved previously we can initiate the library
      if(that.storedSettings && that.storedSettings.smoothValue){
        that.lpf = new that._LPF(that.storedSettings.smoothValue);
      }
    });

     // Load previously stored settings
    if(this.storedSettings && this.storedSettings.smoothValue){
      this.smoothValue = this.storedSettings.smoothValue;
      this._settingsSet = true;
    }else{
      // Default filter value
      this.smoothValue = 0.5;
    }
  };

  /**
   * When hasMissingProperties returns <true>
   * the properties windown will be open automatically after clicking the 
   * canvas block
   */
  LowPassFilter.hasMissingProperties = function() {
    return !this._settingsSet;
  };


  /**
   * Parent is asking me to execute my logic.
   * This block only initiate processing with
   * actions from the hardware.
   */
  LowPassFilter.onExecute = function(event) {
    if(this.lpf){
      if(event.action === 'Filter'){
        // event.data should contain the current value to be corrected
        var result = this.lpf.next(event.data);
        // Send my data to anyone listening
        this.dispatchDataFeed({filtered: result});
        // Send data to logic maker for processing
        this.processData({filtered: result}); 
      }
    }
  };

  /**
   * Triggered when the user clicks on a block.
   * The interace builder is automatically opened.
   * Here we must load the elements.
   * NOTE: This is called with the scope set to the
   * Block object, to emailsess this modules properties
   * use LowPassFilter or this.controller
   */
  LowPassFilter.onClick = function(){
    var that = this;
    easy.clearCustomSettingsPanel();

    // Compile template using current list
    this.myPropertiesWindow = $(this.propTemplate({smoothValue: this.smoothValue}));
    // Display elements
    easy.displayCustomSettings(this.myPropertiesWindow, true);
  };

  /**
   * This method is called when the user hits the "Save"
   * recipe button. Any object you return will be stored
   * in the recipe and can be retrieved during startup (@onLoad) time.
   */
  LowPassFilter.onBeforeSave = function(){
    return {smoothValue: this.smoothValue};
  };

  /**
   * Intercepts the properties panel closing action.
   * Return "false" to abort the action.
   * NOTE: Settings Load/Saving will atomatically
   * stop re-trying if the event propagates.
   */
  LowPassFilter.onCancelProperties = function(){
    console.log("Cancelling Properties");
  };

  /**
   * Intercepts the properties panel save action.
   * You must call the save method directly for the
   * new values to be sent to hardware blocks.
   * @param settings is an object with the values
   * of the elements rendered in the interface.
   * NOTE: For the settings object to contain anything
   * you MUST have rendered the panel using standard
   * ways (easy.showBaseSettings and easy.renderCustomSettings)
   */
  LowPassFilter.onSaveProperties = function(settings){
    console.log("Saving: ", settings);
    
    this.smoothValue = settings.smoothValue;
    // Create/replace instance
    this.lpf = new this._LPF(this.smoothValue);
    this._settingsSet = true;
  };

  return LowPassFilter;
});
