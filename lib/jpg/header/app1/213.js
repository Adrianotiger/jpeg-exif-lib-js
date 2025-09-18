// https://www.media.mit.edu/pia/Research/deepview/exif.html
{

const tagIndex = JPGCONST.EXIF.YCBCR_POS;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"YCbCr Positioning", 
		defaults:{tag:tagIndex, type:3, length:1, value:0}, /* short */
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "YCbCrPositioning (" + name + ")", bigEndian, tagIndex);

				this.TagOptions = {1:"centered", 2:"co-sited"};

				this.IsUserEditable = false;
				this.IsNumber = true;
			}

			performChecks()
			{
				if(typeof this.TagOptions[this.getValue()] === 'undefined')
				{
					console.warn(`YCbCrPositioning unit wrong: ${this.getValue()}, should be one of ${Object.keys(this.TagOptions).join(",")}`);
				}
			}

			toString()
			{
				return this.TagOptions[parseInt(this.getValue())];
			}
		},
});

}