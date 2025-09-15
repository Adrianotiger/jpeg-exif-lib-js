class JPGDHT extends JpgSection
{		
	constructor(buffer, offset)
	{
		super(buffer, offset, "DHT");
		
		this.addAttribute("sectionId", 2);
		this.addAttribute("sectionSize", 2);
		this.addAttribute("tcth", 1, "Tc (DC/AC) and Th (table Id)");
		
		this.addAttribute("symbols", 16);
		
		const uint8Array = this.getAttribute("symbols");
		
		let totalSymbols = 0;
		for(let j=0;j<16;j++) totalSymbols += uint8Array[j];
		
		this.addAttribute("huffman", totalSymbols);
	}
};