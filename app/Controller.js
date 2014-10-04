//Copyright (c) 2014 Dayton Inspires - http://daytoninspires.com/
//
// author: Nick Fahrig - nicklefritzdev@gmail.com
//
//Permission is hereby granted, free of charge, to any person obtaining a copy
//of this software and associated documentation files (the "Software"), to deal
//in the Software without restriction, including without limitation the rights
//to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//copies of the Software, and to permit persons to whom the Software is
//furnished to do so, subject to the following conditions:
//
//The above copyright notice and this permission notice shall be included in
//all copies or substantial portions of the Software.
//
//THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//THE SOFTWARE.

/*
Image Generator Angular Application

This is an angular.js based tool designed for Dayton Inspires.
It will create one image based on user input of the following:
- a background image
- Border color
- text
- style of image


- The background image can either be a preset selection or an uploaded image.
    Each preset selection has different images associated with it to allow for
    a change of style without affecting the quality of an image.  Uploaded
    images are cropped based on the currently selected style and must be re-
    cropped if the style is changed.

- The Border color is actually a set of images for each pre-selected color
    options.  There are different images for each style to scale properly.

- The text entered by a user is placed in the center of the background image
    with a translucent box behind it to increase its readability

- The image style changes what the output image will be.  Current selections
    are Facebook Profile Picture, Facebook cover photo, sticker, and business
    card.


The image is created on the fly using a canvas that the user can see to preview
    the final product.  Once the user is satisfied, the image can be exported
    as either a .png file or a .pdf file.
*/

const MAX_PREVIEW_WIDTH = 1000;
const MAX_PREVIEW_HEIGHT = 500;

//creates the imageGeneratorApp module
var imageGeneratorApp = angular.module('imageGeneratorApp', []);

//angular controller for the imageGeneratorApp
imageGeneratorApp.controller('ImageGeneratorCtrl', function ($scope) {
    
    //Array for the preset background image properties
    $scope.backgroundImage =  [
        { 'path': 'images/imgPicker/inspireDaytonImg1', 'name': 'Sunset', 'fileType':'.jpg' },
        { 'path': 'images/imgPicker/inspireDaytonImg2', 'name': 'Sunrise', 'fileType': '.jpg' },
        { 'path': 'images/imgPicker/inspireDaytonImg3', 'name': 'Plaza', 'fileType': '.jpg' },
        { 'path': 'images/imgPicker/inspireDaytonImg4', 'name': 'Church', 'fileType': '.jpg' },
        { 'path': 'images/imgPicker/inspireDaytonImg5', 'name': 'Bridge', 'fileType': '.jpg' }
    ];    

    //Array for the border color properties
    $scope.borderColors = [
        { 'path': 'images/border/black', 'color': 'black', 'fileType': '.png' },
        { 'path': 'images/border/blue', 'color': 'blue', 'fileType': '.png' },
        { 'path': 'images/border/cyan', 'color': 'cyan', 'fileType': '.png' },
        { 'path': 'images/border/green', 'color': 'green', 'fileType': '.png' },
        { 'path': 'images/border/pink', 'color': 'pink', 'fileType': '.png' },
        { 'path': 'images/border/red', 'color': 'red', 'fileType': '.png' }
    ];

    //Array for the image styles
    $scope.imageStyle = [
        { 'style': 'fb-square', 'name': 'facebook profile photo', 'height': '180', 'width': '180', 'font': '20px Calibri' },
        { 'style': 'fb-wide', 'name': 'facebook cover photo', 'height': '315', 'width': '851', 'font': '40px Calibri' },
        //{ 'style': 'shirt', 'name': 'shirt', 'height': '1650', 'width': '2550', 'font': '200px Georgia' },
        { 'style': 'sticker', 'name': 'sticker', 'height': '819', 'width': '1275', 'font': '90px Georgia' },
        { 'style': 'card', 'name': 'business card ', 'height': '600', 'width': '1050', 'font': '80px Georgia' }
    ];
    
    //currently selected background image properties
    $scope.selectedBackground = $scope.backgroundImage[0];

    //currently selected border color properties
    $scope.selectedBorderColor = $scope.borderColors[0];

    //currently selected image style
    $scope.selectedImageStyle = $scope.imageStyle[0];

    //the selected background image
    $scope.BackgroundImage = new Image();

    //the selected border image
    $scope.BorderImage = new Image();

    //the uploaded image pre crop
    $scope.uploadedImage = { 'raw': new Image(), 'cropped': new Image(), 'ratio': 1 };
    
    //the uploaded image post crop
    //var croppedUploadedImage = new Image();    

    //customer text entered by user
    $scope.customText = '';

    //flag to show loading gif
    $scope.loading = false;

    //flag for using an uploaded background image
    $scope.usingUploadedFile = false;

    //flag for cropping uploaded image
    $scope.SettingUpload = false;    
    
    //initializes the background image
    $scope.BackgroundImage.src = $scope.selectedBackground.path + "-" + $scope.selectedImageStyle.style + $scope.selectedBackground.fileType;

    //initializes the border image
    $scope.BorderImage.src = $scope.selectedBorderColor.path + "-" + $scope.selectedImageStyle.style + $scope.selectedBorderColor.fileType;   

    /// <summary>
    /// Called when a background image is selected.  Sets the selected
    ///background image to the input and updates the image canvas
    /// </summary>
    /// <param name="image">selected background image</param>
    $scope.setBackground = function (image) {
        $scope.loading = true;
        $scope.selectedBackground = image;
        $scope.usingUploadedFile = false;
        
        $scope.BackgroundImage.onload = function () {
            $scope.$apply(function () { $scope.loading = false;});
            $scope.UpdateCanvas($scope.BackgroundImage);
        };
        $scope.BackgroundImage.src = $scope.selectedBackground.path + "-" + $scope.selectedImageStyle.style + $scope.selectedBackground.fileType;
    };

    /// <summary>
    /// Called when a border color is selected.  Sets the selected corder image
    /// to the input and updates the image canvas
    /// </summary>
    /// <param name="color">selected corder color</param>
    $scope.setBorderColor = function (color) {
        $scope.loading = true;
        $scope.selectedBorderColor = color;
        
        $scope.BorderImage.onload = function () {
            $scope.$apply(function () { $scope.loading = false; });
            if (!$scope.usingUploadedFile) {
                $scope.UpdateCanvas($scope.BackgroundImage);
            }
            else {
                $scope.UpdateCanvas($scope.uploadedImage.cropped);
            }
        };
        $scope.BorderImage.src = $scope.selectedBorderColor.path + "-" + $scope.selectedImageStyle.style + $scope.selectedBorderColor.fileType;        
    };

    /// <summary>
    /// Called when an image style is selected.  Sets the selected image style
    /// to the input and updates the image canvas
    /// </summary>
    /// <param name="style">selected image style</param>
    $scope.setImageStyle = function (style) {
        $scope.loading = true;
        $scope.selectedImageStyle = style;
        if (!$scope.usingUploadedFile) {            
            $scope.BackgroundImage.onload = function () {
                $scope.$apply(function () { $scope.loading = false; });
                $scope.setBorderColor($scope.selectedBorderColor);                
            }
            $scope.BackgroundImage.src = $scope.selectedBackground.path + "-" + $scope.selectedImageStyle.style + $scope.selectedBackground.fileType;
        }
        else{
            $scope.setBorderColor($scope.selectedBorderColor);
        }
    };

    /// <summary>
    /// Called when text is entered in the input box.  Sets the custom text to
    /// the value of the picture text input
    /// </summary>
    $scope.setText = function () {
        $scope.customText = $('#picture-text').val();
        if ($scope.usingUploadedFile){
            $scope.UpdateCanvas($scope.uploadedImage.cropped);
            }
        else{
            $scope.UpdateCanvas($scope.BackgroundImage);
        }
    };

    /// <summary>
    /// Called when a file is uploaded. Reads the uploaded file, once its done
    /// calls uploadFile function
    /// </summary>
    /// <param name="element">the upload input element</param>
    $scope.setFiles = function (element) {
        console.log('files:', element.files);
        
        if (element.files[0].type.indexOf("image") > -1) {
            var reader = new FileReader();
            reader.onload = $scope.uploadFile;
            reader.readAsText(element.files[0], 'UTF-8');
        }
    };

    /// <summary>
    /// Draws the all the selected parts to the image canvas
    /// </summary>
    /// <param name="background">The background image to use - whether it is a
    /// preselected one or an uploaded one</param>
    $scope.UpdateCanvas = function (background) {
        var c = document.getElementById('image-canvas');
        var ctx = c.getContext('2d');        

        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(background, 0, 0, $scope.selectedImageStyle.width, $scope.selectedImageStyle.height);

        if ($scope.customText != "") {
            var font = $scope.selectedImageStyle.font; // font style and size for the selected image style
            ctx.font = font; // this needs to be set before the text is measured
            var x = (c.width / 2) - (ctx.measureText($scope.customText).width / 2); // x-location to start drawing custom text
            var y = c.height / 1.5; // y-location to start drawing custom text
            var width = ctx.measureText($scope.customText).width; // width of the custom text          
            var height = parseInt(font, 10); // height of the custom text 


            ctx.fillStyle = "#000033";
            ctx.globalAlpha = 0.5;
            ctx.fillRect(x, y, width, height);
            ctx.fillStyle = 'white';
            ctx.globalAlpha = 1;
            
            ctx.fillText($scope.customText, x, y + height - 5);
        }

        ctx.drawImage($scope.BorderImage, 0, 0, $scope.selectedImageStyle.width, $scope.selectedImageStyle.height);
    };

    /// <summary>
    /// Takes the uploaded picture and loads it into uploadedImage property.
    ///Once done calls placeUploadedPicture function.
    /// </summary>
    $scope.uploadFile = function () {
               
        var file = document.getElementById('fileToUpload').files[0];
        var fileReader = new FileReader();        

        $scope.$apply(function () { $scope.SettingUpload = true; });
        $scope.loading = true;
        $scope.uploadedImage.raw.onload = function () {
            $scope.$apply(function () { $scope.loading = false;});
            $scope.placeUploadedPicture();
        };       

        fileReader.onload = function () {
            var imageData = fileReader.result;
            $scope.uploadedImage.raw.src = imageData;
        }

        fileReader.readAsDataURL(file);
    };

    ///<summary>
    /// Images are cropped based on the selected image style.  First it is
    ///checked that the uploaded image is sufficently large enough for that
    ///selected style. 
    /// A box is displayed the size of the image style.  The user can move
    ///their uploaded image around and place it inside the box - once they let
    ///go of the image. The section of the image inside the box is used as the
    ///background image.  Displays interface for user to crop image to fit into
    ///the selected style.    
    ///<summary>
    $scope.placeUploadedPicture = function () {
        if ($scope.uploadedImage.raw.width < $scope.selectedImageStyle.width || $scope.uploadedImage.raw.height < $scope.selectedImageStyle.height) {
            alert("Uploaded image is too small for the selected style. Try using a different picture or selecting a different style.");
             $scope.SettingUpload = false;
        }
        else {
            $scope.SettingUpload = true;

            if ($scope.uploadedImage.raw.width > MAX_PREVIEW_WIDTH || $scope.uploadedImage.raw.height > MAX_PREVIEW_HEIGHT) {
                if (MAX_PREVIEW_WIDTH / MAX_PREVIEW_HEIGHT > $scope.uploadedImage.raw.width / $scope.uploadedImage.raw.height)
                    $scope.uploadedImage.ratio = MAX_PREVIEW_HEIGHT / $scope.uploadedImage.raw.height;
                else
                    $scope.uploadedImage.ratio = MAX_PREVIEW_WIDTH / $scope.uploadedImage.raw.width;
            }
            else
                $scope.uploadedImage.ratio = 1;

            var c = document.getElementById('custom-image');
            var ctx = c.getContext('2d');
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.rect(0, 0, $scope.selectedImageStyle.width * $scope.uploadedImage.ratio, $scope.selectedImageStyle.height * $scope.uploadedImage.ratio);
            ctx.stroke();
            $('#draggable-image').css('max-width', $scope.uploadedImage.raw.width * $scope.uploadedImage.ratio);
            $('#draggable-image').css('max-height', $scope.uploadedImage.raw.height * $scope.uploadedImage.ratio);
            $scope.usingUploadedFile = true;
        }
    };
    
    /// <summary>
    /// Finds what part of the image is inside of the box and grabs it and sets
    ///the croppedUploadedImage
    /// </summary>
    $scope.SetUploadedPicture = function () {
        var c = document.getElementById('image-canvas');
        var ctx = c.getContext('2d');        
        var boxCoords = $("#custom-image").position(); // coordinates of the box
        var imageCoords = $("#draggable-image").position(); // coordinates of the uploaded image
        var sourceX = (boxCoords.left - imageCoords.left) / $scope.uploadedImage.ratio; // beginning x-position of image inside of box
        var sourceY = (boxCoords.top - imageCoords.top) / $scope.uploadedImage.ratio; // beginning y-position of image inside of box
        var sourceWidth; // width of the image for the background
        var sourceHeight; // height of the image for the background
        var destX = 0; // begginning x-position to place uploaded image in the background
        var destY = 0; // begginning y-position to place uploaded image in the background

        if (sourceX < 0) {
            destX = 0 - sourceX;
            sourceX = 0;
        }
        if (sourceY < 0) {
            destY = 0 - sourceY;
            sourceY = 0;
        }

        sourceWidth = ($scope.selectedImageStyle.width - destX) ;
        sourceHeight = ($scope.selectedImageStyle.height - destX) ;

        ctx.clearRect(0, 0, c.width, c.height);
        //creates the cropped image
        ctx.drawImage($scope.uploadedImage.raw, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, sourceWidth, sourceHeight);

        //saves the cropped image and re-draws the canvas to show all selected parts
        $scope.uploadedImage.cropped.onload = function () {
            $scope.$apply(function () { $scope.SettingUpload = false; });

            $scope.UpdateCanvas($scope.uploadedImage.cropped);
        }
        var tempData = c.toDataURL("image/png;base64");
        $scope.uploadedImage.cropped.src = tempData;
    }
   
    /// <summary>
    /// Generates a png image based on the current state of the image canvas
    /// </summary>
    $scope.getImage = function () {
        $scope.loading = true;
        var canvas = document.getElementById("image-canvas");
        var rawImageData = canvas.toDataURL("image/png;base64");
        window.open(rawImageData);
        $scope.loading = false;
    }

    /// <summary>
    /// Generates a pdf file based on the current state of the image canvas
    /// </summary>
    $scope.getPdf = function () {
        var doc = new jsPDF("landscape", "in");
        var canvas = document.getElementById("image-canvas");
        var ret = { data: null, pending: true }
        var data = canvas.toDataURL('image/jpeg').slice('data:image/jpeg;base64,'.length);
        // Convert the data to binary form
        data = atob(data);
        ret['data'] = data;
        ret['pending'] = false;
        doc.addImage(data, 'JPEG',1,1, $scope.selectedImageStyle.width / 300, $scope.selectedImageStyle.height / 300);

        doc.output('datauri');
    }
    
    // Functions for the dragging and dropping of the uploaded image during cropping
    // taken from: http://jsfiddle.net/YNMEX/1/
    window.onload = function () {
        $("#draggable-image").mousedown(startDrag);
        $("#draggable-image").mouseup(stopDrag);
        //document.onmousedown = startDrag;
        //document.onmouseup = stopDrag;
    }
    function startDrag(e) {
        // determine event object
        if (!e) {
            var e = window.event;
        }

        // IE uses srcElement, others use target
        var targ = e.target ? e.target : e.srcElement;

        if (targ.className != 'dragme') { return };
        // calculate event X, Y coordinates
        offsetX = e.clientX;
        offsetY = e.clientY;

        // assign default values for top and left properties
        if (!targ.style.left) { targ.style.left = '0px' };
        if (!targ.style.top) { targ.style.top = '0px' };

        // calculate integer values for top and left 
        // properties
        coordX = parseInt(targ.style.left);
        coordY = parseInt(targ.style.top);
        drag = true;

        // move div element
        document.onmousemove = dragDiv;

        return false;

    }
    function dragDiv(e) {
        if (!drag) { return };
        if (!e) { var e = window.event };
        var targ = e.target ? e.target : e.srcElement;
        // move div element
        targ.style.left = coordX + e.clientX - offsetX + 'px';
        targ.style.top = coordY + e.clientY - offsetY + 'px';
        return false;
    }
    function stopDrag() {
        drag = false;
        if ($scope.SettingUpload) {
            $scope.SetUploadedPicture();
        }
    }
});