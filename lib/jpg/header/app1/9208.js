// https://www.media.mit.edu/pia/Research/deepview/exif.html
{

const tagIndex = JPGCONST.EXIF.LIGHT_SOURCE;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Light Source", 
		exif: 2.2,
		defaults:{tag:tagIndex, type:3, length:1, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "LightSource (" + name + ")", bigEndian, tagIndex);

				this.TagOptions = {0:"unknown", 1:"daylight", 2:"fluorescent", 3:"tungsten", 4:"flash", 5:"fine weather", 6:"cloudy", 11:"shade", 12:"daylight fluorescent", 255:"other"};

				this.IsUserEditable = false;
				this.IsNumber = true;
			}

			performChecks()
			{
				if(typeof this.TagOptions[this.getValue()] === 'undefined')
				{
					console.warn(`LightSource wrong: ${this.getValue()}, should be one of ${Object.keys(this.TagOptions).join(",")}`);
				}
			}

			toString()
			{
				return this.TagOptions[parseInt(this.getValue())];
			}
		},
});

}