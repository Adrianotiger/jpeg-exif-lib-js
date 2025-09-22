// https://www.media.mit.edu/pia/Research/deepview/exif.html
{

const tagIndex = JPGCONST.EXIF.MAX_APERTURE;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"Max Aperture", 
		exif: 2.2,
		defaults:{tag:tagIndex, type:5, length:1, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "MaxApertureValue (" + name + ")", bigEndian, tagIndex);

				this.IsUserEditable = false;
				this.IsNumber = true;
			}

			toString()
			{
				const apex = this.getValue()[0] / this.getValue()[1];
				return `${parseInt(Math.pow(2, apex / 2) * 100) / 100}`; // e.g. "1/290"
			}
		},
});

}