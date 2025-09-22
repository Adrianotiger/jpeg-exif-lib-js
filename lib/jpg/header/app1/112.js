// https://www.media.mit.edu/pia/Research/deepview/exif.html
{

const tagIndex = JPGCONST.EXIF.ORIENTATION;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Orientation", 
		exif: 2.1,
		defaults:{tag:tagIndex, type:3, length:1, value:9},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "Orientation (" + name + ")", bigEndian, tagIndex);

				this.TagOptions = {1:"upper left", 3:"lower right", 6:"upper right", 8:"lower left", 9:"undefined"};

				this.IsNumber = true;
			}

			toString()
			{
				return this.TagOptions[this.getValue()];
			}

			performChecks()
			{
				if(typeof this.TagOptions[this.getValue()] === 'undefined')
				{
					console.warn(`Orientation is wrong: ${this.getValue()}, should be one of ${Object.keys(this.TagOptions).join(",")}`);
				}
			}
		},
});

}