
// https://www.media.mit.edu/pia/Research/deepview/exif.html
{

const tagIndex = JPGCONST.EXIF.REFERENCE_BW;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Reference Black White", 
		exif: 2.0,
		defaults:{tag:tagIndex, type:5, length:0, value:0}, /* unsigned rational */
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "ReferenceBlackWhite (" + name + ")", bigEndian, tagIndex);

				this.IsUserEditable = false;
				this.IsNumber = true;
				this.IsArray = true;
			}

			performChecks()
			{
				if(this.getValue().length != 3)
				{
					console.warn(`ReferenceBlackWhite should have 3 values`);
				}
			}
			/*
			toString()
			{
				return this.TagOptions[parseInt(this.getValue())];
			}*/
		},
});

}