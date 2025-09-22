// https://www.media.mit.edu/pia/Research/deepview/exif.html
{

const tagIndex = JPGCONST.EXIF.INTEROP_IFD_OFF;

JPGCONST['EXIF_' + tagIndex.toString(16)]  = new JpgConst({
		value:tagIndex, 
		description:"ExifInteroperabilityOffset", 
		exif: 2.1,
		defaults:{tag:tagIndex, type:5, length:1, value:0},
		class:class extends JpgTagSection
		{
			constructor(buffer, offset, name, bigEndian)
			{
				super(buffer, offset, "ExifInteroperabilityOffset (" + name + ")", bigEndian, tagIndex);

				this.IsNumber = true;
			}
		},
});

}