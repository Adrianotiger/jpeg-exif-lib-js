// https://www.media.mit.edu/pia/Research/deepview/exif.html
{

const tagIndex = JPGCONST.EXIF.YCBCR_COEFF;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"YCbCr Coefficient", 
		exif: 2.0,
		defaults:{tag:tagIndex, type:5, length:0, value:0}, /* rational */
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "YCbCrCoefficients (" + name + ")", bigEndian, tagIndex);

				this.IsUserEditable = false;
				this.IsNumber = true;
			}

			performChecks()
			{
				if(this.getValue().length != 3)
				{
					console.warn(`YCbCrCoefficients should have 3 values`);
				}
			}
		},
});

}