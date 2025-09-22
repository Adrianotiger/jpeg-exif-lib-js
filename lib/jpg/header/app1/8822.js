// https://www.media.mit.edu/pia/Research/deepview/exif.html
{

const tagIndex = JPGCONST.EXIF.EXPOSURE_PROG;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Exposure Program", 
		exif: 2.2,
		defaults:{tag:tagIndex, type:3, length:1, value:2},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "ExposureProgram (" + name + ")", bigEndian, tagIndex);

				this.TagOptions = {0:"undefined", 1:"manual", 2:"automatic", 3:"aperture priority", 4:"shutter priority", 5:"creative", 6:"action", 7:"portrait mode", 8:"landscape mode"};

				this.IsUserEditable = true;
				this.IsNumber = true;
			}

			performChecks()
			{
				if(typeof this.TagOptions[this.getValue()] === 'undefined')
				{
					console.warn(`Exposure program wrong: ${this.getValue()}, should be one of ${Object.keys(this.TagOptions).join(",")}`);
				}
			}

			toString()
			{
				return this.TagOptions[parseInt(this.getValue())];
			}
		},
});

}