// https://www.media.mit.edu/pia/Research/deepview/exif.html
{

const tagIndex = JPGCONST.EXIF.RESOLUTION_UNIT;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Resolution Unit", 
		exif: 2.0,
		defaults:{tag:tagIndex, type:3, length:1, value:9},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "Resolution Unit (" + name + ")", bigEndian, tagIndex);

				this.TagOptions = {1:"no unit", 2:"inch", 3:"cm"};

				this.IsUserEditable = false;
				this.IsNumber = true;
			}

			performChecks()
			{
				if(typeof this.TagOptions[this.getValue()] === 'undefined')
				{
					console.warn(`Resolution unit wrong: ${this.getValue()}, should be one of ${Object.keys(this.TagOptions).join(",")}`);
				}
			}

			toString()
			{
				return this.TagOptions[parseInt(this.getValue())];
			}
		},
});

}