import bien from '../assets/images/bien.jpg';
import nui from '../assets/images/nui.jpg';
import amthuc from '../assets/images/amthuc.jpg';
import vanhoa from '../assets/images/vanhoa.jpg';
import bana1 from '../assets/images/bana1.jpg';
import bandao from '../assets/images/bandao.jpg';

const categoriesData = [
    { id: 0, name: 'Tất cả', img: bana1 },
    { id: 1, name: 'Biển', img: bien },
    { id: 2, name: 'Văn hóa', img: vanhoa },
    { id: 3, name: 'Ẩm thực', img: amthuc },
    { id: 4, name: 'Giải trí', img: bana1 },
];

const districtsData = [
    { id: 1, name: 'Tất cả quận' },
    { id: 2, name: 'Hải Châu' },
    { id: 3, name: 'Sơn Trà' },
    { id: 4, name: 'Thanh Khê' },
    { id: 5, name: 'Ngũ Hành Sơn' },
    { id: 6, name: 'Liên Chiểu' },
    { id: 7, name: 'Hòa Vang' },
];

const placesData = [
    {
        id: 1,
        name: 'Bà Nà Hills',
        img: bana1,
        des: 'Khu du lịch trên đỉnh núi cao với khí hậu 4 mùa trong 1 ngày, nổi tiếng với Cầu Vàng huyền thoại và Làng Pháp.',
        infor: 'Bà Nà Hills là một trong những khu du lịch nổi tiếng nhất tại Đà Nẵng, nằm trên núi Chúa thuộc huyện Hòa Vang. Nơi đây nổi bật với khí hậu mát mẻ, cảnh quan thiên nhiên tuyệt đẹp và nhiều công trình kiến trúc độc đáo.\n\nĐến với Bà Nà Hills, du khách có thể tham quan Cầu Vàng, Làng Pháp, Fantasy Park và trải nghiệm hệ thống cáp treo giữa núi rừng. Đây là địa điểm phù hợp cho cả gia đình, nhóm bạn và những người yêu thích khám phá.',
        stars: 4.8,
        price: 900000,
        priceDisplay: '900.000 đ',
        category: 'Giải trí',
        address: 'Hòa Vang',
        time: '08:00 - 18:00',
        move: 'Xe máy, ô tô, xe buýt',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3893.74617948977!2d108.14729407520427!3d16.073660584606497!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314218d68dff9545%3A0x714561e9f3a7292c!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBCw6FjaCBLaG9hIC0gxJDhuqFpIGjhu41jIMSQw6AgTuG6tW5n!5e1!3m2!1svi!2s!4v1788395381790!5m2!1svi!2s'
    },

    {
        id: 2,
        name: 'Cầu Vàng (Golden Bridge)',
        img: bandao,
        des: 'Biểu tượng kiến trúc độc đáo với đôi bàn tay khổng lồ nâng đỡ cây cầu nổi tiếng thế giới.',
        infor: 'Cầu Vàng là một công trình kiến trúc nổi tiếng nằm trong khu du lịch Bà Nà Hills, Đà Nẵng. Cây cầu gây ấn tượng bởi thiết kế độc đáo với đôi bàn tay đá khổng lồ nâng đỡ thân cầu giữa núi rừng.\n\nTừ trên Cầu Vàng, du khách có thể ngắm nhìn toàn cảnh núi rừng và tận hưởng không khí trong lành. Đây cũng là một trong những địa điểm check-in nổi tiếng và được nhiều du khách lựa chọn khi đến Đà Nẵng.',
        stars: 4.9,
        price: 0,
        priceDisplay: 'Miễn phí',
        category: 'Giải trí',
        address: 'Hòa Vang',
        time: '08:00 - 18:00',
        move: 'Xe máy, ô tô, xe buýt',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3893.991958237527!2d108.22511767520393!3d16.061104184617246!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219d2f38ce45d%3A0xbfa47dd116d4db88!2zQ-G6p3UgUuG7k25nLCDEkMOgIE7hurVuZyA1NTAwMDAsIFZp4buHdCBOYW0!5e1!3m2!1svi!2s!4v1788396694907!5m2!1svi!2s'
    },

    {
        id: 3,
        name: 'Biển Mỹ Khê',
        img: bien,
        des: 'Một trong những bãi biển quyến rũ nhất hành tinh với bờ cát trắng mịn và làn nước trong xanh.',
        infor: 'Biển Mỹ Khê là một trong những bãi biển nổi tiếng nhất tại thành phố Đà Nẵng. Bãi biển sở hữu bờ cát trắng mịn, làn nước trong xanh và không gian rộng rãi, thích hợp cho các hoạt động vui chơi và nghỉ dưỡng.\n\nDu khách có thể đến Mỹ Khê để tắm biển, ngắm bình minh, đi dạo dọc bờ biển hoặc thưởng thức các món hải sản tại những nhà hàng gần khu vực.',
        stars: 4.7,
        price: 0,
        priceDisplay: 'Miễn phí',
        category: 'Biển',
        address: 'Sơn Trà',
        time: '08:00 - 18:00',
        move: 'Xe máy, ô tô, xe buýt',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7787.951127848847!2d108.24202409212164!3d16.0619420384657!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31421782f7fa0ee3%3A0xeafb8ba272ee55ac!2zQsOjaSBiaeG7g24gTeG7uSBLaMOq!5e1!3m2!1svi!2sus!4v1788396774732!5m2!1svi!2sus'
    },

    {
        id: 4,
        name: 'Bán đảo Sơn Trà',
        img: nui,
        des: 'Lá phổi xanh của thành phố Đà Nẵng với hệ sinh thái phong phú và cảnh quan núi rừng hùng vĩ sát biển.',
        infor: 'Bán đảo Sơn Trà nằm cách trung tâm thành phố Đà Nẵng khoảng 10km về phía Đông Bắc. Được mệnh danh là "viên ngọc xanh" của thành phố, nơi đây sở hữu hệ sinh thái rừng nguyên sinh phong phú cùng những bãi biển hoang sơ tuyệt đẹp.\n\nĐến với Sơn Trà, du khách không chỉ được hòa mình vào thiên nhiên hùng vĩ mà còn có cơ hội viếng thăm Chùa Linh Ứng, nơi có tượng Phật Bà Quan Âm nổi bật hướng ra biển. Du khách cũng có thể chinh phục Đỉnh Bàn Cờ để ngắm toàn cảnh thành phố từ trên cao.',
        stars: 4.6,
        price: 0,
        priceDisplay: 'Miễn phí',
        category: 'Biển',
        address: 'Sơn Trà',
        time: '08:00 - 18:00',
        move: 'Xe máy, ô tô, xe buýt',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d249133.31358100995!2d108.11088354381765!3d16.126593049698688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31423d72d1be522d%3A0x1e7339a6534e4e7!2zQsOhbiDEkeG6o28gU8ahbiBUcsOg!5e1!3m2!1svi!2sus!4v1788396840081!5m2!1svi!2sus'
    },

    {
        id: 5,
        name: 'Chợ Đêm Sơn Trà & Ẩm Thực Đà Thành',
        img: amthuc,
        des: 'Thiên đường ẩm thực đường phố sầm uất với các món đặc sản hải sản tươi sống, mì Quảng, bánh xèo.',
        infor: 'Chợ Đêm Sơn Trà là một trong những địa điểm được nhiều du khách lựa chọn để khám phá không khí về đêm và ẩm thực Đà Nẵng. Khu vực này có nhiều gian hàng bán các món ăn đường phố và đặc sản địa phương.\n\nDu khách có thể thưởng thức nhiều món ăn hấp dẫn như hải sản, mì Quảng, bánh xèo, các món nướng và nhiều món ăn đường phố khác với mức giá phù hợp.',
        stars: 4.5,
        price: 150000,
        priceDisplay: 'Từ 150.000 đ',
        category: 'Ẩm thực',
        address: 'Sơn Trà',
        time: '08:00 - 18:00',
        move: 'Xe máy, ô tô, xe buýt',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d249133.31358100995!2d108.11088354381765!3d16.126593049698688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31423d72d1be522d%3A0x1e7339a6534e4e7!2zQsOhbiDEkeG6o28gU8ahbiBUcsOg!5e1!3m2!1svi!2sus!4v1788396840081!5m2!1svi!2sus'
    },

    {
        id: 6,
        name: 'Bảo tàng Điêu khắc Chăm',
        img: vanhoa,
        des: 'Nơi lưu giữ bộ sưu tập nghệ thuật điêu khắc Champa quy mô và độc đáo nhất trên thế giới.',
        infor: 'Bảo tàng Điêu khắc Chăm là một trong những địa điểm văn hóa nổi bật tại trung tâm thành phố Đà Nẵng. Bảo tàng lưu giữ nhiều hiện vật và tác phẩm nghệ thuật có giá trị liên quan đến nền văn hóa Champa.\n\nĐến đây, du khách có thể tìm hiểu về lịch sử, văn hóa và nghệ thuật điêu khắc của người Chăm thông qua các tượng đá, phù điêu và hiện vật được trưng bày trong bảo tàng.',
        stars: 4.4,
        price: 60000,
        priceDisplay: '60.000 đ',
        category: 'Văn hóa',
        address: 'Hải Châu',
        time: '08:00 - 18:00',
        move: 'Xe máy, ô tô, xe buýt',
        mapUrl: 'https://www.google.com/maps?q=Bảo+tàng+Điêu+khắc+Chăm,+Đà+Nẵng&output=embed'
    },

    {
        id: 7,
        name: 'Danh thắng Ngũ Hành Sơn',
        img: nui,
        des: 'Quần thể 5 ngọn núi đá vôi hội tụ vẻ đẹp tâm linh với nhiều hang động huyền bí và chùa cổ.',
        infor: 'Ngũ Hành Sơn là quần thể gồm năm ngọn núi đá vôi nổi tiếng nằm ở phía Đông Nam thành phố Đà Nẵng. Mỗi ngọn núi mang một tên gọi gắn với ngũ hành và sở hữu cảnh quan thiên nhiên đặc trưng.\n\nNơi đây nổi bật với hệ thống hang động, chùa cổ và các công trình tâm linh. Du khách có thể khám phá các hang động, tham quan chùa chiền và ngắm nhìn cảnh quan thành phố từ trên cao.',
        stars: 4.6,
        price: 40000,
        priceDisplay: '40.000 đ',
        category: 'Văn hóa',
        address: 'Ngũ Hành Sơn',
        time: '08:00 - 18:00',
        move: 'Xe máy, ô tô, xe buýt',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d249133.31358100995!2d108.11088354381765!3d16.126593049698688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31423d72d1be522d%3A0x1e7339a6534e4e7!2zQsOhbiDEkeG6o28gU8ahbiBUcsOg!5e1!3m2!1svi!2sus!4v1788396840081!5m2!1svi!2sus'
    },

    {
        id: 8,
        name: 'Cầu Rồng Phun Lửa & Phun Nước',
        img: bandao,
        des: 'Cây cầu mang hình dáng con rồng thép vươn ra biển Đông, phun lửa và nước vào cuối tuần.',
        infor: 'Cầu Rồng là một trong những biểu tượng nổi bật của thành phố Đà Nẵng. Cây cầu có thiết kế hình con rồng vươn mình qua sông Hàn, tạo nên một điểm nhấn đặc biệt cho thành phố.\n\nVào các tối cuối tuần, Cầu Rồng có chương trình phun lửa và phun nước thu hút đông đảo người dân và du khách. Đây là một địa điểm thích hợp để tham quan, chụp ảnh và trải nghiệm không khí về đêm của Đà Nẵng.',
        stars: 4.8,
        price: 0,
        priceDisplay: 'Miễn phí',
        category: 'Giải trí',
        address: 'Hải Châu',
        time: '08:00 - 18:00',
        move: 'Xe máy, ô tô, xe buýt',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d249133.31358100995!2d108.11088354381765!3d16.126593049698688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31423d72d1be522d%3A0x1e7339a6534e4e7!2zQsOhbiDEkeG6o28gU8ahbiBUcsOg!5e1!3m2!1svi!2sus!4v1788396840081!5m2!1svi!2sus'
    }
];

export { categoriesData, placesData, districtsData };
