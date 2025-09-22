// https://www.media.mit.edu/pia/Research/deepview/exif.html
{

const tagIndex = JPGCONST.EXIF.FLASH;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Flash", 
		exif: 2.2,
		defaults:{tag:tagIndex, type:3, length:1, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "Flash (" + name + ")", bigEndian, tagIndex);

				this.TagOptions = {0:"flash fired", 1:"light status 0", 2:"light status 1", 3:"flash mode 0", 4:"flash mode 1", 5:"flash function present", 6:"red-eye reduction"};

				this.IsUserEditable = false;
				this.IsNumber = true;
			}

			performChecks()
			{
				if(typeof this.TagOptions[this.getValue()] === 'undefined')
				{
					console.warn(`Flash wrong: ${this.getValue()}, should be one of ${Object.keys(this.TagOptions).join(",")}`);
				}
			}

			toString()
			{
				return this.TagOptions[parseInt(this.getValue())];
			}
		},
});

}