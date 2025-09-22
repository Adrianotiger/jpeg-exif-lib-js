// https://www.media.mit.edu/pia/Research/deepview/exif.html
{

const tagIndex = JPGCONST.EXIF.METERING_MODE;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Metering Mode", 
		exif: 2.2,
		defaults:{tag:tagIndex, type:3, length:1, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "MeteringMode (" + name + ")", bigEndian, tagIndex);

				this.TagOptions = {0:"unknown", 1:"avarage", 2:"center-weighted", 3:"spot", 4:"multi-spot", 5:"pattern", 6:"partial", 255:"other"};

				this.IsUserEditable = false;
				this.IsNumber = true;
			}

			performChecks()
			{
				if(typeof this.TagOptions[this.getValue()] === 'undefined')
				{
					console.warn(`MeteringMode wrong: ${this.getValue()}, should be one of ${Object.keys(this.TagOptions).join(",")}`);
				}
			}

			toString()
			{
				return this.TagOptions[parseInt(this.getValue())];
			}
		},
});

}